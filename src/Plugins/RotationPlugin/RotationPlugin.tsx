// <-  imports
import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node } from 'gl-react'
import rotShader from './rotation.glsl'
import centerShader from './centerer.glsl'
import Slider from '@material-ui/lab/Slider'
import { Card, CardContent, Button } from '@material-ui/core'
import { IZoomPlugin } from '../ZoomPlugin/ZoomPlugin'
import { Tooltip } from '../BasePlugin/BasePlugin'
import { Point, fromTex, rotate, toTex, DummyRenderSize } from '../../Util'
import { SettingsType } from '../../Hook'

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
                    component: CentererComponent,
                    inversePoint: this.undoCurrentCenterer,
                    priority: 11,
                },
                // then rotate it
                Rotation: {
                    component: RotationComponent,
                    inversePoint: this.undoCurrentRotation,
                    priority: 10,
                },
            },
            /** %endRotationHooks  */
            ViewerSide: {
                Rotation: {
                    component: SliderComponent,
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
                    type: SettingsType.Toggle,
                    value: () => this.keepCenter,
                    action: this.toggleKeepCenter,
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

    undoCurrentCenterer (point: Point): Point {
        let size = this.centererSizes
        let maxDim = this.maxDims

        let uOffset = (maxDim - size[0]) / 2.0 / maxDim
        let vOffset = (maxDim - size[1]) / 2.0 / maxDim
        let uWidth = 1.0 - 2.0 * uOffset
        let vWidth = 1.0 - 2.0 * vOffset

        point = [(point[0] - uOffset) / uWidth, (point[1] - vOffset) / vWidth]
        return point
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

export const RotationComponent = Component(function RotationNode (props) {
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
export const CentererComponent = Component(function CentererNode (props) {
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

const SliderComponent = Component(function RotationSlider () {
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
