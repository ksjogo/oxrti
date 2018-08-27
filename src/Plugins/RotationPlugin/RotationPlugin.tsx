// <-  imports
import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node } from 'gl-react'
import rotShader from './rotation.glsl'
import centerShader from './centerer.glsl'
import Slider from '@material-ui/lab/Slider'
import { Card, CardContent, Button, Switch } from '@material-ui/core'
import { IZoomPlugin } from '../ZoomPlugin/ZoomPlugin'
import { Tooltip } from '../BasePlugin/BasePlugin'
import { Point, fromTex, rotate, toTex, DummyRenderSize } from '../../Util'

const RotationModel = Plugin.props({
    rad: 0,
    keepCenter: true,
})

export class RotationController extends shim(RotationModel, Plugin) {

    get hooks () {
        return {
            /** %beginRotationHooks  */
            // register two nodes inside the rendering stack
            // higher priority will be run first
            ViewerRender: {
                // first center the underlying texture
                Centerer: {
                    component: CentererUI,
                    inversePoint: this.undoCurrentCenterer,
                    forwardPoint: this.doCurrentCenterer,
                    priority: 11,
                },
                // then rotate it
                Rotation: {
                    component: RotationUI,
                    inversePoint: this.undoCurrentRotation,
                    forwardPoint: this.doCurrentRotation,
                    priority: 10,
                },
            },
            /** %endRotationHooks  */
            ViewerSide: {
                Rotation: {
                    component: RotationSlider,
                    priority: 10,
                },
            },
            Bookmarks: {
                Rotation: {
                    key: 'rotation',
                    save: this.saveBookmark,
                    restore: this.restoreBookmark,
                },
            },
            ScreenshotMeta: {
                Rotation: {
                    key: 'rotation',
                    snapshot: () => this.rad,
                },
            },
            Settings: {
                ShowSliders: {
                    title: 'Rotate around visible center',
                    component: SettingsKeepCenter,
                },
            },
        }
    }

    @action
    toggleKeepCenter () {
        this.keepCenter = !this.keepCenter
    }

    saveBookmark () {
        return [this.rad]
    }

    @action
    restoreBookmark (values: number[]) {
        this.rad = values[0]
    }

    @action
    onSlider (event: any, value: number) {
        let currentCenter = this.inversePoint([0.5, 0.5])
        this.rad = value
        if (this.keepCenter)
            this.zoomer.zoomOnPoint(currentCenter)
    }

    undoCurrentRotation (point: Point): Point {
        point = fromTex(point)
        point = rotate(point, this.rad)
        point = toTex(point)
        return point
    }

    doCurrentRotation (point: Point): Point {
        point = fromTex(point)
        point = rotate(point, -this.rad)
        point = toTex(point)
        return point
    }

    get uOffset () {
        return (this.maxDims - this.centererSizes[0]) / 2.0 / this.maxDims
    }

    get vOffset () {
        return (this.maxDims - this.centererSizes[1]) / 2.0 / this.maxDims
    }

    get uWidth () {
        return 1.0 - 2.0 * this.uOffset
    }

    get vWidth () {
        return 1.0 - 2.0 * this.vOffset
    }

    undoCurrentCenterer (point: Point): Point {
        return [(point[0] - this.uOffset) / this.uWidth, (point[1] - this.vOffset) / this.vWidth]
    }

    doCurrentCenterer (point: Point): Point {
        return [point[0] * this.uWidth + this.uOffset, point[1] * this.vWidth + this.vOffset]
    }

    get maxDims () {
        let [width, height] = this.centererSizes
        return width * Math.cos(Math.PI / 4) + height * Math.sin(Math.PI / 4)
    }

    get centererSizes () {
        let btf = this.appState.btf()
        let height = btf ? btf.data.height : DummyRenderSize
        let width = btf ? btf.data.width : DummyRenderSize
        return [width, height]
    }

    @action
    resetRotation () {
        this.rad = 0
    }

    get zoomer () {
        return this.appState.plugins.get('ZoomPlugin') as IZoomPlugin
    }
}

const { Plugin: RotationPlugin, Component } = PluginCreator(RotationController, RotationModel, 'RotationPlugin')
export default RotationPlugin
export type IRotationPlugin = typeof RotationPlugin.Type

export const RotationUI = Component(function RotationNode (props) {
    let maxDims = this.maxDims
    return <Node
        width={maxDims}
        height={maxDims}
        shader={{
            frag: rotShader,
        }}
        uniforms={{
            children: props.children,
            angle: this.rad,
        }} />
})

/** %beginCenterer */
export const CentererUI = Component(function CentererNode (props) {
    // dynamic sizes depending on the loaded btf
    // if the btf changes, the uniforms will be updated automatically
    let [width, height] = this.centererSizes
    let maxDims = this.maxDims
    // create one gl-react Node
    return <Node
        width={maxDims}
        height={maxDims}
        shader={{
            // shader from import centerShader from './centerer.glsl'
            frag: centerShader,
        }}
        // uniforms will be automatically type-converted to the appropiate WebGL types
        uniforms={{
            // refering to rendering output one step before
            children: props.children,
            inputHeight: height,
            inputWidth: width,
            maxDim: maxDims,
        }} />
})
/** %endCenterer */

const RotationSlider = Component(function RotationSlider () {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <Tooltip title='Reset'>
                <Button onClick={this.resetRotation} style={{ marginLeft: '-8px' }}>Rotation</Button>
            </Tooltip>
            <Tooltip title={this.rad}>
                <Slider value={this.rad} onChange={this.onSlider} min={-Math.PI} max={Math.PI} />
            </Tooltip>
        </CardContent>
    </Card>
})

const SettingsKeepCenter = Component(function SettingsKeepCenter (props) {
    return <Tooltip title='Keep visible center when using rotation slider'>
        <Switch
            onChange={this.toggleKeepCenter}
            checked={this.keepCenter}
        />
    </Tooltip>
})
