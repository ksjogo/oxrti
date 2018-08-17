// <-  imports
import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders } from 'gl-react'
import { types } from 'mobx-state-tree'
import rotShader from './rotation.glsl'
import centerShader from './centerer.glsl'
import Slider from '@material-ui/lab/Slider'

import { Point, fromTex, rotate, toTex, DummyRenderSize } from '../../Math'

const RotationModel = Plugin.props({
    rad: 0,
})

class RotationController extends shim(RotationModel, Plugin) {

    get hooks () {
        return {
            ViewerRender: {
                Centerer: {
                    component: CentererComponent,
                    inversePoint: this.undoCurrentCenterer,
                    priority: 11,
                },
                Rotation: {
                    component: RotationComponent,
                    inversePoint: this.undoCurrentRotation,
                    priority: 10,
                },
            },
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
        }
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

export const CentererComponent = Component(function CentererNode (props) {
    let [width, height] = this.centererSizes
    let maxDims = this.maxDims
    return <Node
        width={maxDims}
        height={maxDims}
        shader={{
            frag: centerShader,
        }}
        uniforms={{
            children: props.children,
            inputHeight: height,
            inputWidth: width,
            maxDim: maxDims,
        }} />
})

import { Card, CardContent, Button, Tooltip } from '@material-ui/core'
import { IZoomPlugin } from '../ZoomPlugin/ZoomPlugin'

const SliderComponent = Component(function RotationSlider (props) {
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
