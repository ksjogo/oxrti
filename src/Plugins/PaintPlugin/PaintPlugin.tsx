// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->

import { Point, Node2PNG } from '../../Math'
import { Switch, Theme, createStyles } from '@material-ui/core'

import paintShader from './paint.glsl'
import mixerShader from './mixer.glsl'
import initShader from './init.glsl'

import { observable } from 'mobx'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import TrashIcon from '@material-ui/icons/Delete'

let LayerConfig = types.model({
    visible: types.boolean,
    name: types.string,
})

const PaintModel = Plugin.props({
    title: 'Paint',
    color: types.optional(types.array(types.number), observable.array([1, 0, 0, 1])),
    center: types.optional(types.array(types.number), observable.array([0.5, 0.5])),
    brushRadius: 5,
    activeLayer: -1,
    layers: types.optional(types.array(LayerConfig), []),
})

class PaintController extends shim(PaintModel, Plugin) {
    drawing = false
    initialized = false

    layerCount () {
        return this.layers.length
    }

    hooks () {
        return {
            ViewerTabFocus: {
                Paint: {
                    beforeGain: this.beforeFocusGain,
                    beforeLose: this.beforeFocusLose,
                },
            },
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
            PreDownload: {
                Layers: {
                    func: this.exportLayers,
                },
            },
            PostLoad: {
                Layers: {
                    func: this.importLayers,
                },
            },
        }
    }

    @action
    async beforeFocusGain () {
        this.drawing = false
        console.log('before gain')
    }

    @action
    async beforeFocusLose () {
        this.drawing = false
        await this.exportLayers()
        console.log('before lose')
    }

    @action
    dragger (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point) {
        if (this.activeLayer !== -1) {
            this.drawing = true
            this.center[0] = nextTex[0]
            this.center[1] = nextTex[1]
            return true
        }
    }

    @action
    setActiveLayer (value) {
        this.activeLayer = value
    }

    @action
    setDrawing (value) {
        this.drawing = value
    }

    handleActiveLayer (index) {
        return (event) => {
            this.setDrawing(false)
            this.setActiveLayer(this.activeLayer === index ? -1 : index)
        }
    }

    @action
    setVisibility (index, value) {
        this.layers[index].visible = value
    }

    handleVisibility (index) {
        return (event, value) => {
            this.setVisibility(index, value)
        }
    }

    @action
    deleteLayer (index: number) {
        console.log(index)
    }

    handleDelete (index) {
        return (event) => {
            this.deleteLayer(index)
        }
    }

    @action
    setInitialized (value) {
        this.initialized = value
    }

    @action
    addLayer (e) {
        if (this.layers.length >= 15)
            return alert('Max 15 layers supported due to WebGL implementation limits.')

        this.layers.push(LayerConfig.create({
            visible: true,
            name: `${this.layers.length}`,
        }))
    }

    refs: { [key: number]: Node } = {}

    handleRef (index: number) {
        return (node: Node) => {
            this.refs[index] = node
        }
    }

    @action
    async exportLayers () {
        let btf = this.appState.btf()
        let canvas = document.createElement('canvas')
        btf.layers = await Promise.all(this.layers.map(async (layer, index) => {
            let data = await Node2PNG(this.refs[index], btf.data.width, btf.data.height, canvas)
            return {
                name: layer.name,
                texture: data,
            }
        }))
    }

    @action
    onDraw () {
        if (this.appState.loadingTextures === 0)
            this.setInitialized(true)
    }

    @action
    importLayers () {
        let btf = this.appState.btf()
        this.layers = observable.array(btf.layers.map(layer => {
            return LayerConfig.create({
                visible: true,
                name: layer.name,
            })
        }))
        this.initialized = false
    }
}

const { Plugin: PaintPlugin, Component } = PluginCreator(PaintController, PaintModel, 'PaintPlugin')
export default PaintPlugin
export type IZoomPlugin = typeof PaintPlugin.Type

const styles = (theme: Theme) => createStyles({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    active: {
        backgroundColor: theme.palette.action.active,
    },
})

const PaintUI = Component(function PaintUI (props, classes) {
    return <div>
        <h3>Paint</h3>
        <button onClick={this.addLayer}>Add Layer</button>
        <List>
            {this.layers.map((layer, index) => (
                <ListItem
                    key={index}
                    role={undefined}
                    dense
                    button
                    onClick={this.handleActiveLayer(index)}
                >
                    <Checkbox
                        checked={this.activeLayer === index}
                        tabIndex={-1}
                        disableRipple
                    />
                    <ListItemText primary={`Layer ${index + 1}`} />
                    <ListItemSecondaryAction>
                        <Switch
                            onChange={this.handleVisibility(index)}
                            checked={layer.visible}
                        />
                        <IconButton aria-label='Trash' onClick={this.handleDelete(index)} >
                            <TrashIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    </div>
}, styles)

import { Shaders, Node, GLSL, Bus } from 'gl-react'

const PaintNode = Component(function PaintNode (props) {
    let btf = props.appState.btf()
    let width = btf.data.width
    let height = btf.data.height
    let brush = this.brushRadius / width
    // just render the input texture if we got no other layers to put on top
    if (this.layers.length === 0)
        return <Node
            shader={{
                frag: initShader,
            }}
            uniforms={{
                children: props.children,
            }} />
    else
        // return one mixer node, which stiches the underlying rendered object and the annotations together
        return <Node
            onDraw={this.onDraw}
            shader={{
                // we need to recompile the shader for different layer amounts
                frag: mixerShader.replace(/\[X\]/gi, `[${this.layerCount()}]`).replace('< layerCount', ` < ${this.layerCount()}`),
            }}
            uniforms={{
                children: props.children,
                layerVisibility: this.layers.map(l => l.visible),
            }}
            width={width}
            height={height}
        >
            {// map all layers into the `layer` uniform of the mixer shader
                this.layers.map((layer, index) => {
                    return <Bus uniform={'layer'} key={`${btf.id}_layer${index}`} index={index} >
                        <Node
                            ref={this.handleRef(index)}
                            width={width}
                            height={height}
                            shader={{
                                frag: this.initialized ? paintShader : initShader,
                            }}
                            clear={null}
                            uniforms={
                                this.initialized ? {
                                    drawing: this.drawing && this.activeLayer === index,
                                    color: this.color.slice(),
                                    center: this.center.slice(),
                                    brushRadius: brush,
                                } : {
                                        children: btf.annotationTexForRender(layer.name),
                                    }} />
                    </Bus>
                })}
        </Node >
})
