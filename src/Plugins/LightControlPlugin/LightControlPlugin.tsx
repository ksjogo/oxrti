import React from 'react'
import Plugin, { PluginCreator, PluginComponentType } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders } from 'gl-react'
import { Surface } from 'gl-react-dom'
import { Typography, Theme, createStyles, Card, CardContent } from '@material-ui/core'
import hemispherical from './Hemisphere'
import { SafeGLIInspector, Tooltip } from '../BasePlugin/BasePlugin'
import { Debounce } from 'lodash-decorators'
import Slider from '@material-ui/lab/Slider'

const RenderMargin = 20

const LightControlModel = Plugin.props({
    displayX: 0,
    displayY: 0,
    x: 0,
    y: 0,
    z: 0,
    showSliders: false,
})

class LightController extends shim(LightControlModel, Plugin) {
    hemisphereTo = [0.5, 0.5, 0.5, 0.6]
    hemisphereFrom = [1, 0, 0, 1]

    get hooks () {
        return {
            ViewerSide: {
                Rotation: {
                    component: SliderComponent,
                    priority: 90,
                },
            },
            Bookmarks: {
                LightControl: {
                    key: 'lightcontrol',
                    save: this.saveBookmark,
                    restore: this.restoreBookmark,
                },
            },
            ScreenshotMeta: {
                LightControl: {
                    key: 'lightposition',
                    fullshot: this.saveBookmark,
                    snapshot: this.saveBookmark,
                },
            },
            Settings: {
                ShowSliders: {
                    type: SettingsType.Toggle,
                    value: () => this.showSliders,
                    action: this.toggleShowSliders,
                },
            },
        }
    }

    @action
    toggleShowSliders () {
        this.showSliders = !this.showSliders
    }

    @action
    saveBookmark () {
        return [this.x, this.y]
    }

    @action
    restoreBookmark (values: number[]) {
        this.x = values[0]
        this.y = values[1]
        this.fixHemis()
    }

    @action
    onSliderX (event: any, value: number) {
        this.x = value
        this.fixHemis()
        this.displayX = this.x
        this.displayY = this.y
    }

    @action
    onSliderY (event: any, value: number) {
        this.y = value
        this.fixHemis()
        this.displayX = this.x
        this.displayY = this.y
    }

    @action
    fixHemis () {
        let hemis = hemispherical(this.x, this.y)
        this.x = hemis[0]
        this.y = hemis[1]
        this.z = hemis[2]
    }

    // volatile
    dragging = false
    // dragging as from https://gl-react-cookbook.surge.sh/paint
    @action
    updatePosition (e: MouseEvent) {
        let rect = (e.target as any).getBoundingClientRect()
        let x = (e.clientX - rect.left) / (rect.width) * 2 - 1
        let y = (rect.bottom - e.clientY) / (rect.height) * 2 - 1

        let point: Point = [x, y]
        let rotationPlugin = this.appState.plugins.get('RotationPlugin') as IRotationPlugin
        if (rotationPlugin) {
            point = rotate(point, rotationPlugin.rad)
        }
        let hemis = hemispherical(point[0], point[1])
        this.displayX = hemis[0]
        this.displayY = hemis[1]
        this.setXYZThrottled(hemis)
    }

    @Debounce(100, {
        trailing: true,
    })
    setXYZThrottled (hemis: number[]) {
        this.setXYZ(hemis)
    }

    @action
    setXYZ (hemis: number[]) {
        this.x = hemis[0]
        this.y = hemis[1]
        this.z = hemis[2]
    }

    @action
    onMouseLeave () {
        this.dragging = false
    }

    onMouseMove (e: MouseEvent) {
        if (this.dragging) {
            this.updatePosition(e)
        }
    }

    @action
    onMouseDown (e: MouseEvent) {
        this.dragging = true
        this.updatePosition(e)
    }

    @action
    onMouseUp () {
        this.dragging = false
    }

    get lightPos (): number[] {
        if (this.x === 0 && this.y === 0)
            return normalize([0.00001, -0.00001, 1])
        return [this.x, this.y, this.z]
    }
}

const { Plugin: LightControlPlugin, Component } = PluginCreator(LightController, LightControlModel, 'LightControlPlugin')
export default LightControlPlugin
export type ILightControlPlugin = typeof LightControlPlugin.Type

const styles = (theme: Theme) => createStyles({
    dragger: {
        // margin: `${RenderMargin}px`,
    },
})

const SliderComponent = Component(function LightControlComponent (props) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <SafeGLIInspector>
                <HemisphereComponent />
            </SafeGLIInspector>
            {this.showSliders && <>
                <Typography>Pos X</Typography>
                <Slider value={this.x} onChange={this.onSliderX} min={-1} max={1} />
                <Typography>Pos Y</Typography>
                <Slider value={this.y} onChange={this.onSliderY} min={-1} max={1} />
                <Typography>Hemispherical</Typography>
                <p>x: {this.x} <br />
                    y: {this.y}<br />
                    z: {this.z}</p>
            </>}
        </CardContent>
    </Card>
})

import shader from './hemisphere.glsl'
import { toTex, rotate, Point, normalize } from '../../Util'
import { IRotationPlugin } from '../RotationPlugin/RotationPlugin'
import { BaseNodeProps } from '../RendererPlugin/BaseNode'
import { SettingsType } from '../../Hook'

const HemisphereComponent = Component(function Hemisphere (props, classes) {
    let point: Point = [this.displayX, this.displayY]
    let rotationPlugin = props.appState.plugins.get('RotationPlugin') as IRotationPlugin
    if (rotationPlugin) {
        point = rotate(point, -rotationPlugin.rad)
    }
    let inner = <div style={{
        marginLeft: 'calc(50% - 75px)',
    }}>
        <Surface
            className={classes.dragger}
            width={150}
            height={150}
            onMouseLeave={this.onMouseLeave}
            onMouseMove={this.onMouseMove}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}>
            <Node shader={{
                frag: shader,
            }}
                uniforms={{
                    point: toTex(point),
                    fromColor: this.hemisphereFrom.slice(0),
                    toColor: this.hemisphereTo.slice(0),
                }} />
        </Surface>
    </div>
    return this.showSliders ? inner : <Tooltip
        title={<p>x: {this.x}<br />y: {this.y}</p>}
    >
        {inner}
    </Tooltip>
}, styles)
