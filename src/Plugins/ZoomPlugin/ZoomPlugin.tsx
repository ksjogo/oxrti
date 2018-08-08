// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->

import Slider from '@material-ui/lab/Slider'
import shader from './zoom.glsl'
import { Point, translate } from '../../Math'

const ZoomModel = Plugin.props({
    title: 'Zoom',
    scale: 1,
    panX: 0,
    panY: 0,
})

class ZoomController extends shim(ZoomModel, Plugin) {

    hooks () {
        return {
            ViewerRender: {
                Zoom: {
                    priority: -20,
                    component: ZoomNode,
                    inversePoint: this.undoZoomAndPan,
                },
            },
            ViewerSide: {
                Pan: {
                    component: Pan,
                    priority: 21,
                },
                Zoom: {
                    component: Zoom,
                    priority: 20,
                },
            },
            ViewerDrag: {
                Pan: {
                    dragger: this.dragger,
                    priority: -10,
                },
            },
        }
    }

    @action
    dragger (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point) {
        if (oldScreen) {
            this.panX += nextScreen[0] - oldScreen[0]
            this.panY += nextScreen[1] - oldScreen[1]
        }
        return true
    }

    @action
    onSlider (event, value) {
        this.scale = value
    }

    @action
    onSliderX (event, value) {
        this.panX = value
    }

    @action
    onSliderY (event, value) {
        this.panY = value
    }

    undoZoomAndPan (point: Point): Point {
        return [
            (point[0] - this.panX - 0.5) / this.scale + 0.5,
            (point[1] - this.panY - 0.5) / this.scale + 0.5,
        ]
    }
}

const { Plugin: ZoomPlugin, Component } = PluginCreator(ZoomController, ZoomModel, 'ZoomPlugin')
export default ZoomPlugin
export type IZoomPlugin = typeof ZoomPlugin.Type

const ZoomNode = Component(function ZoomNode (props) {
    return <ShaderNode
        shader={{
            frag: shader,
        }}
        uniforms={{
            children: props.children,
            scale: 1 / this.scale,
            panX: this.panX,
            panY: this.panY,
        }} />
})

const Zoom = Component(function ZoomSlider (props) {
    return <div>
        <h3>Zoom</h3>
        <Slider value={this.scale} onChange={this.onSlider} min={0} max={10} />
    </div>
})

const Pan = Component(function PanSlider (props) {
    return <div>
        <h3>Pan</h3>
        <Slider value={this.panX} onChange={this.onSliderX} min={-1} max={1} />
        <Slider value={this.panY} onChange={this.onSliderY} min={-1} max={1} />
    </div>
})
