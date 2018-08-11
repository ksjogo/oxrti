// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->

import { Point, Node2PNG } from '../../Math'
import { Switch, Theme, createStyles, Button, Popover, Card, CardContent, CardActions, Typography } from '@material-ui/core'

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
import uniqid from 'uniqid'
import { ChromePicker } from 'react-color'
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from '@attently/riek'

let LayerConfig = types.model({
    visible: types.boolean,
    name: types.string,
    id: types.string,
})

const PaintModel = Plugin.props({
    title: 'Paint',
    color: types.optional(types.array(types.number), observable.array([1, 0, 0, 1])),
    center: types.optional(types.array(types.number), observable.array([0.5, 0.5])),
    brushRadius: 5,
    activeLayer: -1,
    layers: types.optional(types.array(LayerConfig), []),
})

/**
 * This plugin allows the overlay of multiple paint layers onto
 */
class PaintController extends shim(PaintModel, Plugin) {
    showColorPicker = false

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
                    dragger: this.dragger,
                    draggerLeft: this.draggerLeft,
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

    /**
     * Import layers from btf if we were tabbed out/int
     */
    @action
    async beforeFocusGain () {
        this.drawing = false
        this.importLayers()
    }

    @action
    async beforeFocusLose () {
        this.drawing = false
        await this.exportLayers()
    }

    /**
     * The shaders do the actual drawing, so we just update their uniforms
     */
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
    draggerLeft () {
        this.drawing = false
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

    /**
     * Delete a layer, we need to export/import to cache bust the gl-react uniforms
     * @param index to be removed
     */
    @action
    async deleteLayer (index: number) {
        this.activeLayer = -1
        let renderer = this.appState.plugins.get('RendererPlugin') as IRendererPlugin
        renderer.showPopover('Imp/Exporting Layers into the shaders. Performance will be improved in the future.')
        await sleep(10)
        this.exportLayers(index)
        this.importLayers()
        renderer.showPopover()
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

        // texture will be empty automatically
        this.layers.push(LayerConfig.create({
            visible: true,
            name: `${this.layers.length}`,
            id: uniqid(),
        }))
    }

    refs: { [key: string]: Node } = {}
    handleRef (id: string) {
        return (node: Node) => {
            this.refs[id] = node
        }
    }

    @action
    exportLayers (skipIndex = -1) {
        let btf = this.appState.btf()
        let layers = this.layers.map(layer => {
            let data = Node2PNG(this.refs[layer.id], btf.data.width, btf.data.height)
            return {
                name: layer.name,
                texture: data,
                id: uniqid(), // update id to cache bust old annotation states
            }
        })
        if (skipIndex !== -1)
            layers.splice(skipIndex, 1)
        btf.layers = layers
    }

    @action
    onDraw () {
        if (this.appState.loadingTextures === 0)
            this.setInitialized(true)
    }

    key = null
    @action
    importLayers () {
        let btf = this.appState.btf()
        this.layers = observable.array(btf.layers.map(layer => {
            return LayerConfig.create({
                visible: true,
                name: layer.name,
                id: layer.id,
            })
        }))
        this.initialized = false
        // update our mixer key to cache bust
        this.key = uniqid()
    }

    /**
     * Adapted shader to have fixed unrollable loops for the WebGL compiler
     */
    mixerShader () {
        return mixerShader.replace(/\[X\]/gi, `[${this.layerCount()}]`).replace('< layerCount', ` < ${this.layerCount()}`)
    }

    anchorEl
    @action
    switchColorPicker (e) {
        this.anchorEl = e.target
        this.showColorPicker = !this.showColorPicker
    }

    displayColor (text = false) {
        if (text)
            return (this.color[0] + this.color[1] + this.color[2]) < 1.5 ? 'white' : 'black'
        else
            return `rgb(${this.color.map((e, i) => {
                return i === 3 ? e : e * 255
            }).join(',')})`
    }

    @action
    handleColorChange (color) {
        this.color = observable.array([color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255, color.rgb.a])
    }

    @action
    setLayerName (index, name) {
        this.layers[index].name = name
    }

    handleLayerName (index) {
        return (change) => {
            this.setLayerName(index, change.name)
        }
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

/**
 * List of layers
 */
const PaintUI = Component(function PaintUI (props, classes) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <Typography variant='headline' component='h3'>
                Layers
          </Typography>
            <List>
                {this.layers.map((layer, index) => (
                    <ListItem
                        key={index}
                        role={undefined}
                        dense
                        button
                    >
                        <Checkbox
                            onClick={this.handleActiveLayer(index)}
                            checked={this.activeLayer === index}
                            tabIndex={-1}
                            disableRipple
                        />
                        <ListItemText>
                            <RIEInput
                                value={layer.name}
                                change={this.handleLayerName(index)}
                                propName='name' />
                        </ListItemText>
                        {/* <ListItemText primary={`${layer.id}`} /> */}
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
        </CardContent>
        <CardActions>
            <Button onClick={this.addLayer}>Add Layer</Button>
            <Button style={{
                backgroundColor: this.displayColor(),
                color: this.displayColor(true),
                textShadow: this.color[3] < 0.3 ? '1px 1px 1px black' : '',
            }} onClick={this.switchColorPicker}>Pick Color</Button>
            <Popover
                anchorEl={this.anchorEl}
                open={this.showColorPicker}
                onClose={this.switchColorPicker}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}>
                <ChromePicker
                    color={{ r: this.color[0] * 255, g: this.color[1] * 255, b: this.color[2] * 255, a: this.color[3] }}
                    onChange={this.handleColorChange}
                />
            </Popover>
        </CardActions>
    </Card>
}, styles)

import { Shaders, Node, GLSL, Bus } from 'gl-react'
import { sleep } from '../../util'
import { IRendererPlugin } from '../RendererPlugin/RendererPlugin'

/**
 * Actual painting node inside the render stack
 */
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
            key={this.key}
            onDraw={this.onDraw}
            shader={{
                frag: this.mixerShader(),
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
                    return <Bus uniform={'layer'} key={`${layer.id}`} index={index} >
                        <Node
                            ref={this.handleRef(layer.id)}
                            width={width}
                            height={height}
                            shader={{
                                frag: this.initialized ? paintShader : initShader,
                            }}
                            clear={null}
                            uniforms={
                                // and then write on it
                                this.initialized ? {
                                    drawing: this.drawing && this.activeLayer === index,
                                    color: this.color.slice(0, 4),
                                    center: this.center.slice(0, 3),
                                    brushRadius: brush,
                                } : {
                                        // clear is null, so we initially grap the loaded texture
                                        children: btf.annotationTexForRender(layer.id),
                                    }} />
                    </Bus>
                })}
        </Node >
})
