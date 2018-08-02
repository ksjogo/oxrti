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
    color: types.optional(types.array(types.number), observable.array([1, 0, 0, 1])),
    center: types.optional(types.array(types.number), observable.array([0.5, 0.5])),
    brushRadius: 5,
    layers: 2,
    activeLayer: 0,
    layersVisible: types.optional(types.array(types.boolean), observable.array([true, false])),
})

class PaintController extends shim(PaintModel, Plugin) {
    drawing = false

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
    let width = btf ? btf.data.width : DummyRenderSize
    let height = btf ? btf.data.height : DummyRenderSize
    let brush = this.brushRadius / width
    return <Node
        shader={{
            // we need to recompile the shader for different layer amounts
            frag: mixerShader.replace(/\[X\]/gi, `[${this.layers}]`).replace('< layerCount', `< ${this.layers}`),
        }}
        uniforms={{
            children: props.children,
            layerVisibility: this.layersVisible.slice(),
        }}
        width={width}
        height={height}
    >
        {// map all layers into the `layer` uniform of the mixer shader
            this.layersVisible.map((visible, index) => {
                return <Bus uniform={'layer'} key={`layer${index}`} >
                    <Node
                        width={width}
                        height={height}
                        shader={{
                            frag: paintShader,
                        }}
                        clear={null}
                        uniforms={{
                            drawing: this.drawing && this.activeLayer === index,
                            color: this.color.slice(),
                            center: this.center.slice(),
                            brushRadius: brush,
                        }} />
                </Bus>
            })}
    </Node >
})
