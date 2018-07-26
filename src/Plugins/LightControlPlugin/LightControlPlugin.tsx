// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { Typography } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'

// oxrti default imports ->

const LightControlModel = Plugin.props({
    title: 'LightControl',
    x: 0.5,
    y: 0.5,
    z: 1,
})

class LightController extends shim(LightControlModel, Plugin) {

    hooks () {
        return {
            ViewerSide: {
                Rotation: {
                    component: SliderComponent,
                    priority: 0,
                },
            },
        }
    }

    @action
    onSliderX (event, value) {
        this.x = value
    }
    @action
    onSliderY (event, value) {
        this.y = value
    }
    @action
    onSliderZ (event, value) {
        this.z = value
    }
}

const { Plugin: LightControlPlugin, Component } = PluginCreator(LightController, LightControlModel, 'LightControlPlugin')
export default LightControlPlugin

const SliderComponent = Component(function RotationSlider (props) {
    return <div>
        <h3>Light</h3>
        <Typography>Pos X</Typography>
        <Slider default={0.5} value={this.x} onChange={this.onSliderX} min={0} max={1} />
        <Typography>Pos Y</Typography>
        <Slider default={0.5} value={this.y} onChange={this.onSliderY} min={0} max={1} />
        <Typography>Pos Z</Typography>
        <Slider default={1} value={this.z} onChange={this.onSliderZ} min={0} max={1} />
    </div>
})
