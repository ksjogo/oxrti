// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, Shaders } from '../../Plugin'
// oxrti default imports ->

import rotShader from './rotation.glsl'
import centerShader from './centerer.glsl'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'

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
                    priority: 11,
                },
                Rotation: {
                    component: RotationComponent,
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
    let btf = props.appState.btf()
    let height = btf ? btf.height : 300
    let width = btf ? btf.width : 300
    let maxDims = width * Math.cos(Math.PI / 4) + height * Math.sin(Math.PI / 4)
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
