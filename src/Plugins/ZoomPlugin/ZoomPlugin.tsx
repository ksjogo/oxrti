// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->

import Slider from '@material-ui/lab/Slider'
import shader from './zoom.glsl'
import Typography from '@material-ui/core/Typography'

const ZoomModel = Plugin.props({
    title: 'Zoom',
    scale: 1,
})

class ZoomController extends shim(ZoomModel, Plugin) {

    hooks () {
        return {
            ViewerRender: {
                Zoom: {
                    priority: -20,
                    component: ZoomComponent,
                },
            },
            ViewerSide: {
                Zoom: {
                    component: SliderComponent,
                    priority: 20,
                },
            },
        }
    }

    @action
    onSlider (event, value) {
        this.scale = value
    }
}

const { Plugin: ZoomPlugin, Component } = PluginCreator(ZoomController, ZoomModel, 'ZoomPlugin')
export default ZoomPlugin
export type IZoomPlugin = typeof ZoomPlugin.Type

const ZoomComponent = Component(function ZoomNode (props) {
    return <ShaderNode
        shader={{
            frag: shader,
        }}
        uniforms={{
            children: props.children,
            scale: 1 / this.scale,
        }} />
})

const SliderComponent = Component(function ZoomSlider (props) {
    return <div>
        <h3>Zoom</h3>
        <Slider value={this.scale} onChange={this.onSlider} min={0} max={10} />
    </div>
})
