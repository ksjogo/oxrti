// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { IAppState } from '../../State/AppState'
// oxrti default imports ->

import shader from './rotation.glsl'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'

const RotationModel = Plugin.props({
    title: 'Rotation',
    angle: 0,
})

class RotationController extends shim(RotationModel, Plugin) {

    prepareHooks (appState: IAppState) {
        appState.renderStack.insert('Rotation:Rotation', 10)
        appState.addViewerSideHook('Rotation:Slider')
    }

    components () {
        return {
            'Rotation': RotationComponent,
            'Slider': SliderComponent,
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
