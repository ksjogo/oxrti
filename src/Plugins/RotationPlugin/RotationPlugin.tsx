// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->

import shader from './rotation.glsl'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'

const RotationModel = Plugin.props({
    title: 'Rotation',
    angle: 0,
})

class RotationController extends shim(RotationModel, Plugin) {

    hooks () {
        return {
            ViewerRender: {
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
        this.angle = value
    }
}

const { Plugin: RotationPlugin, Component } = PluginCreator(RotationController, RotationModel, 'RotationPlugin')
export default RotationPlugin

const RotationComponent = Component(function RotationNode (props) {
    return <ShaderNode
        shader={{
            frag: shader,
        }}
        uniforms={{
            children: props.children,
            angle: this.angle / 360 * Math.PI * 2,
        }} />
})

const SliderComponent = Component(function RotationSlider (props) {
    return <div>
        <Typography>Rotation</Typography>
        <Slider value={this.angle} onChange={this.onSlider} min={0} max={360} />
    </div>
})
