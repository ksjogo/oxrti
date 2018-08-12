// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, Shaders } from '../../Plugin'
// oxrti default imports ->

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
        }
    }
    @action
    saveBookmark () {
        return [this.rad]
    }

    @action
    restoreBookmark (values) {
        this.rad = values[0]
    }

    @action
    onSlider (event, value) {
        this.rad = value
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
}

const { Plugin: RotationPlugin, Component } = PluginCreator(RotationController, RotationModel, 'RotationPlugin')
export default RotationPlugin
export type IRotationPlugin = typeof RotationPlugin.Type

const RotationComponent = Component(function RotationNode (props) {
    let maxDims = this.maxDims
    return <ShaderNode
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

const CentererComponent = Component(function RotationNode (props) {
    let [width, height] = this.centererSizes
    let maxDims = this.maxDims
    return <ShaderNode
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

import { Card, CardContent, Button } from '@material-ui/core'

const SliderComponent = Component(function RotationSlider (props) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <Button onClick={this.resetRotation} style={{ marginLeft: '-8px' }}>Rotation</Button>
            <Slider value={this.rad} onChange={this.onSlider} min={-Math.PI} max={Math.PI} />
        </CardContent>
    </Card>
})
