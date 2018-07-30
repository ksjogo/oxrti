// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->
import { Surface } from 'gl-react-dom'
import { Typography } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import hemispherical from './Hemisphere'

const LightControlModel = Plugin.props({
    title: 'LightControl',
    x: 0,
    y: 0,
    hemisphereFrom: types.optional(types.array(types.number), [1, 0, 1]),
    hemisphereTo: types.optional(types.array(types.number), [1, 1, 0]),
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

    // dragging as from https://gl-react-cookbook.surge.sh/paint
    // volatile
    dragging = false
    @action
    updatePosition (e) {
        let rect = e.target.getBoundingClientRect()
        let x = (e.clientX - rect.left) / rect.width * 2 - 1
        let y = (rect.bottom - e.clientY) / rect.height * 2 - 1
        let hemis = hemispherical(x, y)
        this.x = hemis[0]
        this.y = hemis[1]
    }

    @action
    onMouseLeave () {
        this.dragging = false
    }

    @action
    onMouseMove (e) {
        if (this.dragging) {
            this.updatePosition(e)
        }
    }

    @action
    onMouseDown (e) {
        this.dragging = true
        this.updatePosition(e)
    }

    @action
    onMouseUp () {
        this.dragging = false
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
        <HemisphereComponent />
        <p>x: {this.hemisphericalCoords()[0]} <br />y: {this.hemisphericalCoords()[1]}<br />z: {this.hemisphericalCoords()[2]}</p>
    </div>
})

import shader from './hemisphere.glsl'

const HemisphereComponent = Component(function Hemisphere (props, classes) {
    return <Surface
        width={150}
        height={150}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}>
        <ShaderNode shader={{
            frag: shader,
        }}
            uniforms={{
                point: [this.x / 2 + 0.5, this.y / 2 + 0.5],
                fromColor: this.hemisphereFrom.slice(0),
                toColor: this.hemisphereTo.slice(0),
            }} />
    </Surface>
})
