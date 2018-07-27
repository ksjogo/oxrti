// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { Typography } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import hemispherical from './Hemisphere'

// oxrti default imports ->

const LightControlModel = Plugin.props({
    title: 'LightControl',
    x: 0,
    y: 0,
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

    hemisphericalCoords () {
        return hemispherical(this.x, this.y)
    }
}

const { Plugin: LightControlPlugin, Component } = PluginCreator(LightController, LightControlModel, 'LightControlPlugin')
export default LightControlPlugin
export type ILightControlPlugin = typeof LightControlPlugin.Type

const SliderComponent = Component(function RotationSlider (props) {
    return <div>
        <h3>Light</h3>
        <Typography>Pos X</Typography>
        <Slider default={0} value={this.x} onChange={this.onSliderX} min={-1} max={1} />
        <Typography>Pos Y</Typography>
        <Slider default={0} value={this.y} onChange={this.onSliderY} min={-1} max={1} />
        <Typography>Hemispherical</Typography>
        <p>x: {this.hemisphericalCoords()[0]} <br />y: {this.hemisphericalCoords()[1]}<br />z: {this.hemisphericalCoords()[2]}</p>
    </div>
})
