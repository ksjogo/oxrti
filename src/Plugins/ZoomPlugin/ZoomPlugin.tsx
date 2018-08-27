import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders } from 'gl-react'
import { types } from 'mobx-state-tree'
import Slider from '@material-ui/lab/Slider'
import shader from './zoom.glsl'
import { Point, rotate, sub } from '../../Util'
import { Card, CardContent, Typography, Button } from '@material-ui/core'
import { IRendererPlugin } from '../RendererPlugin/RendererPlugin'
import { IRotationPlugin } from '../RotationPlugin/RotationPlugin'
import { Tooltip } from '../BasePlugin/BasePlugin'

const ZoomModel = Plugin.props({
    scale: 1,
    panX: 0,
    panY: 0,
})

export class ZoomController extends shim(ZoomModel, Plugin) {

    get hooks () {
        return {
            ViewerRender: {
                Zoom: {
                    priority: -20,
                    component: ZoomNode,
                    inversePoint: this.undoZoomAndPan,
                    forwardPoint: this.doZoomAndPan,
                },
            },
            ViewerSide: {
                Zoom: {
                    component: ZoomUI,
                    priority: 21,
                },
            },
            ViewerMouse: {
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
            ScreenshotMeta: {
                Zoom: {
                    key: 'zoom',
                    snapshot: () => this.scale,
                },
                Pan: {
                    key: 'pan',
                    snapshot: () => [this.panX, this.panY],
                },
            },
        }
    }

    @action
    saveBookmark () {
        return [this.scale, this.panX, this.panY]
    }

    @action
    restoreBookmark (values: number[]) {
        this.onSlider(null, values[0])
        this.onSliderX(null, values[1])
        this.onSliderY(null, values[2])
    }

    @action
    dragger (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point, dragging: boolean) {
        if (dragging && oldScreen) {
            this.panX += nextScreen[0] - oldScreen[0]
            this.panY += nextScreen[1] - oldScreen[1]
        }
        return true
    }

    @action
    onSlider (event: any, value: number) {
        let currentCenter = this.inversePoint([0.5, 0.5])
        this.scale = value
        this.zoomOnPoint(currentCenter)
    }

    @action
    onSliderX (event: any, value: number) {
        this.panX = value
    }

    @action
    onSliderY (event: any, value: number) {
        this.panY = value
    }

    @action
    diffPanX (value: number) {
        this.panX += value * this.scale
    }

    @action
    diffPanY (value: number) {
        this.panY += value * this.scale
    }

    undoZoomAndPan (point: Point): Point {
        return [
            (point[0] - this.panX - 0.5) / this.scale + 0.5,
            (point[1] - this.panY - 0.5) / this.scale + 0.5,
        ]
    }

    doZoomAndPan (point: Point): Point {
        return [
            (point[0] - 0.5) * this.scale + this.panX + 0.5,
            (point[1] - 0.5) * this.scale + this.panY + 0.5,
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

    @action
    zoomOnPoint (target: Point, multi = 9) {
        for (let m = 0; m < multi; m++) {
            let currentCenter = this.inversePoint([0.5, 0.5])
            let move = sub(target, currentCenter)
            move = rotate(move, -this.rotater.rad)
            this.diffPanX(-move[0])
            this.diffPanY(-move[1])
        }
    }
    get rotater () {
        let rot = this.appState.plugins.get('RotationPlugin') as IRotationPlugin
        return rot
    }
}

const { Plugin: ZoomPlugin, Component } = PluginCreator(ZoomController, ZoomModel, 'ZoomPlugin')
export default ZoomPlugin
export type IZoomPlugin = typeof ZoomPlugin.Type

const ZoomNode = Component(function ZoomNode (props) {
    let renderer = this.appState.plugins.get('RendererPlugin') as IRendererPlugin
    return <Node
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

const ZoomUI = Component(function ZoomSlider (props) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <Tooltip title='Reset'>
                <Button onClick={this.resetZoom} style={{ marginLeft: '-8px' }}>Zoom</Button>
            </Tooltip>
            <Tooltip title={this.scale}>
                <Slider value={this.scale} onChange={this.onSlider} min={0.01} max={30} />
            </Tooltip>
            <Tooltip title='Reset'>
                <Button onClick={this.resetPan} style={{ marginLeft: '-11px' }}>Pan</Button>
            </Tooltip>
            <Tooltip title={this.panX}>
                <Slider value={this.panX} onChange={this.onSliderX} min={-1 * this.scale} max={1 * this.scale} />
            </Tooltip>
            <Tooltip title={this.panY}>
                <Slider value={this.panY} onChange={this.onSliderY} min={-1 * this.scale} max={1 * this.scale} />
            </Tooltip>
        </CardContent>
    </Card>
})
