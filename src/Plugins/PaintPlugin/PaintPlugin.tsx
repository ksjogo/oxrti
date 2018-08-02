// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->

import { Point, DummyRenderSize } from '../../Math'
import { Switch } from '@material-ui/core'

import paintShader from './paint.glsl'
import mixerShader from './mixer.glsl'
import { observable } from 'mobx'

const PaintModel = Plugin.props({
    title: 'Paint',
    enabled: false,
    drawing: false,
    color: types.optional(types.array(types.number), observable.array([1, 0, 0, 1])),
    center: types.optional(types.array(types.number), observable.array([0.5, 0.5])),
    brushRadius: 5,
})

class PaintController extends shim(PaintModel, Plugin) {
    hooks () {
        return {
            ViewerRender: {
                PaintNode: {
                    priority: 100,
                    component: PaintNode,
                },
            },
            ViewerSide: {
                PaintControl: {
                    component: PaintUI,
                    priority: 24,
                },
            },
            ViewerDrag: {
                Pan: {
                    func: this.dragger,
                    priority: 100,
                },
            },
        }
    }

    @action
    dragger (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point) {
        if (this.enabled) {
            this.drawing = true
            this.center[0] = nextTex[0]
            this.center[1] = nextTex[1]
            return true
        }
    }

    @action
    onToggle (event, value) {
        this.enabled = value
        this.drawing = false
    }
}

const { Plugin: PaintPlugin, Component } = PluginCreator(PaintController, PaintModel, 'PaintPlugin')
export default PaintPlugin
export type IZoomPlugin = typeof PaintPlugin.Type

const PaintUI = Component(function PaintUI (props) {
    return <div>
        <h3>Paint</h3>
        <Switch checked={this.enabled} onChange={this.onToggle} />
    </div>
})

import { Shaders, Node, GLSL, Bus } from 'gl-react'

const PaintNode = Component(function PaintNode (props) {
    let btf = props.appState.btf()
    let brush = this.brushRadius / (btf ? btf.width : DummyRenderSize)
    let width = btf ? btf.width : DummyRenderSize
    let height = btf ? btf.height : DummyRenderSize
    return <Node
        shader={{ frag: mixerShader }}
        uniformsOptions={{
            painted: { interpolation: 'nearest' },
        }}
        uniforms={{
            children: props.children,
        }}
        width={width}
        height={height}
    >
        <Bus uniform='painted'>
            <Node
                width={width}
                height={height}
                shader={{
                    frag: paintShader,
                }}
                clear={null}
                uniforms={{
                    drawing: this.drawing,
                    color: this.color.slice(),
                    center: this.center.slice(),
                    brushRadius: brush,
                }} />
        </Bus>
    </Node >
})
