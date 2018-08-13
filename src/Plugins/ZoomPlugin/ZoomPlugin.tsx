// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->

import Slider from '@material-ui/lab/Slider'
import shader from './zoom.glsl'
import { Point, translate, Node2PNG } from '../../Math'
import { Card, CardContent, Typography, Button } from '@material-ui/core'
import { IRendererPlugin } from '../RendererPlugin/RendererPlugin';
import { sleep } from '../../util'

const ZoomModel = Plugin.props({
    scale: 1,
    panX: 0,
    panY: 0,
})

class ZoomController extends shim(ZoomModel, Plugin) {

    get hooks () {
        return {
            ViewerRender: {
                Zoom: {
                    priority: -20,
                    component: ZoomNode,
                    inversePoint: this.undoZoomAndPan,
                },
            },
            ViewerSide: {
                Zoom: {
                    component: Zoom,
                    priority: 21,
                },
            },
            ViewerDrag: {
                Pan: {
                    dragger: this.dragger,
                    priority: -10,
                },
            },
            Bookmarks: {
                Zoom: {
                    key: 'zoom',
                    save: this.saveBookmark,
                    restore: this.restoreBookmark,
                },
            },
        }
    }

    @action
    saveBookmark () {
        return [this.scale, this.panX, this.panY]
    }

    @action
    restoreBookmark (values) {
        this.onSlider(null, values[0])
        this.onSliderX(null, values[1])
        this.onSliderY(null, values[2])
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

    @action
    resetZoom () {
        this.scale = 1
    }

    @action
    resetPan () {
        this.panX = 0
        this.panY = 0
    }
}

const { Plugin: ZoomPlugin, Component } = PluginCreator(ZoomController, ZoomModel, 'ZoomPlugin')
export default ZoomPlugin
export type IZoomPlugin = typeof ZoomPlugin.Type

const ZoomNode = Component(function ZoomNode (props) {
    let renderer = this.appState.plugins.get('RendererPlugin') as IRendererPlugin
    return <ShaderNode
        height={renderer.elementHeight}
        width={renderer.elementWidth}
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
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <Button onClick={this.resetZoom} style={{ marginLeft: '-8px' }}>Zoom</Button>
            <Slider value={this.scale} onChange={this.onSlider} min={0} max={30} />
            <Button onClick={this.resetPan} style={{ marginLeft: '-11px' }}>Pan</Button>
            <Slider value={this.panX} onChange={this.onSliderX} min={-1} max={1} />
            <Slider value={this.panY} onChange={this.onSliderY} min={-1} max={1} />
        </CardContent>
    </Card>
})
