// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, Shaders } from '../../Plugin'
// oxrti default imports ->

import rotShader from './rotation.glsl'
import centerShader from './centerer.glsl'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'
import { Point, fromTex, rotate, toTex } from '../../Math'

const RotationModel = Plugin.props({
    title: 'Rotation',
    rad: 0,
})

class RotationController extends shim(RotationModel, Plugin) {

    hooks () {
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
        }
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
        let size = this.centererSizes()
        let maxDim = this.maxDims(size[0], size[1])

        let uOffset = (maxDim - size[0]) / 2.0 / maxDim
        let vOffset = (maxDim - size[1]) / 2.0 / maxDim
        let uWidth = 1.0 - 2.0 * uOffset
        let vWidth = 1.0 - 2.0 * vOffset

        return [(point[0] - uOffset) / uWidth, (point[1] - vOffset) / vWidth]
    }

    maxDims (width: number, height: number) {
        return width * Math.cos(Math.PI / 4) + height * Math.sin(Math.PI / 4)
    }

    centererSizes () {
        let btf = this.appState.btf()
        let height = btf ? btf.height : 300
        let width = btf ? btf.width : 300
        return [height, width]
    }
}

const { Plugin: RotationPlugin, Component } = PluginCreator(RotationController, RotationModel, 'RotationPlugin')
export default RotationPlugin
export type IRotationPlugin = typeof RotationPlugin.Type

const RotationComponent = Component(function RotationNode (props) {
    return <ShaderNode
        shader={{
            frag: rotShader,
        }}
        uniforms={{
            children: props.children,
            angle: this.rad,
        }} />
})

const CentererComponent = Component(function RotationNode (props) {
    let [height, width] = this.centererSizes()
    let maxDims = this.maxDims(width, height)
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

const SliderComponent = Component(function RotationSlider (props) {
    return <div>
        <h3>Rotation</h3>
        <Slider value={this.rad} onChange={this.onSlider} min={-Math.PI} max={Math.PI} />
    </div>
})
