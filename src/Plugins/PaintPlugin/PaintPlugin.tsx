import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { Point, Node2PNG } from '../../Math'
import { Switch, Theme, createStyles, Button, Popover, Card, CardContent, CardActions, Typography, TextField } from '@material-ui/core'
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
import { RIEInput } from '@attently/riek'
import FileSaver from 'file-saver'
import { Node, Bus } from 'gl-react'
import { sleep, JSONY } from '../../util'
import { IRendererPlugin } from '../RendererPlugin/RendererPlugin'

import paintShader from './paint.glsl'
import mixerShader from './mixer.glsl'
import initShader from './init.glsl'

let LayerConfig = types.model({
    visible: types.boolean,
    name: types.string,
    id: types.string,
})

const PaintModel = Plugin.props({
    color: types.optional(types.array(types.number), observable.array([1, 0, 0, 1])),
    center: types.optional(types.array(types.number), observable.array([0.5, 0.5])),
    brushRadius: 5,
    activeLayer: -1,
    layers: types.optional(types.array(LayerConfig), []),
})

enum DrawingState {
    Outside = 1,
    Hovering,
    Drawing,
}

/**
 * This plugin allows the overlay of multiple paint layers onto
 */
class PaintController extends shim(PaintModel, Plugin) {
    showColorPicker = false

    drawing = DrawingState.Outside
    initialized = false

    get layerCount () {
        return this.layers.length
    }

    get hooks () {
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
            ViewerMouse: {
                Pan: {
                    listener: this.dragger,
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
            ViewerFileAction: {
                Fullshot: {
                    component: Fullshot,
                    priority: 80,
                },
            },
        }
    }

    /**
     * Import layers from btf if we were tabbed out/int
     */
    @action
    async beforeFocusGain () {
        this.drawing = DrawingState.Outside
        this.importLayers()
    }

    @action
    async beforeFocusLose () {
        this.drawing = DrawingState.Outside
        await this.exportLayers()
    }

    /**
     * The shaders do the actual drawing, so we just update their uniforms
     */
    @action
    dragger (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point, dragging: boolean) {
        if (this.activeLayer === -1 || this.activeLayer > this.layerCount)
            return false

        this.center[0] = nextTex[0]
        this.center[1] = nextTex[1]

        if (dragging && this.activeLayer !== -1)
            this.drawing = DrawingState.Drawing
        else
            this.drawing = DrawingState.Hovering

        return true
    }

    @action
    draggerLeft () {
        this.drawing = DrawingState.Outside
    }

    @action
    setActiveLayer (value: number) {
        this.activeLayer = value
    }

    @action
    setDrawing (value: DrawingState) {
        this.drawing = value
    }

    handleActiveLayer (index: number) {
        return (event: React.MouseEvent<HTMLElement>) => {
            this.setDrawing(DrawingState.Outside)
            this.setActiveLayer(this.activeLayer === index ? -1 : index)
        }
    }

    @action
    setVisibility (index: number, value: boolean) {
        this.layers[index].visible = value
    }

    handleVisibility (index: number) {
        return (event: React.ChangeEvent<HTMLInputElement>, value: boolean) => {
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

    handleDelete (index: number) {
        return (event: React.MouseEvent<HTMLElement>) => {
            this.deleteLayer(index)
        }
    }

    @action
    setInitialized (value: boolean) {
        this.initialized = value
    }

    @action
    addLayer (event: React.MouseEvent<HTMLElement>) {
        if (this.layers.length >= 15)
            return alert('Max 15 layers supported due to WebGL implementation limits.')

        // texture will be empty automatically
        this.layers.push(LayerConfig.create({
            visible: true,
            name: `${this.layers.length}`,
            id: uniqid(),
        }))
    }

    @action
    exportLayers (skipIndex = -1) {
        let btf = this.appState.btf()
        let layers = this.layers.map(layer => {
            let data = Node2PNG(this.ref(layer.id), btf.data.width, btf.data.height)
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

    key = uniqid()
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
        return mixerShader.replace(/\[X\]/gi, `[${this.layerCount}]`).replace('< layerCount', ` < ${this.layerCount}`)
    }

    anchorEl: HTMLElement
    @action
    switchColorPicker (e: React.MouseEvent<HTMLElement>) {
        this.anchorEl = e.target as HTMLElement
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
    handleColorChange (color: any) {
        this.color = observable.array([color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255, color.rgb.a])
    }

    @action
    setLayerName (index: number, name: string) {
        this.layers[index].name = name
    }

    handleLayerName (index: number) {
        return (change: any) => {
            this.setLayerName(index, change.name)
        }
    }

    fullshot () {
        let btf = this.appState.btf()
        let blob = Node2PNG(this.ref('mixer'), btf.data.width, btf.data.height)
        FileSaver.saveAs(blob, `${btf.name}_full.png`)
        let meta: { [key: string]: any } = {}

        this.appState.hookForEach('ScreenshotMeta', (hook) => {
            if (hook.fullshot)
                meta[hook.key] = hook.fullshot()
        })
        blob = new Blob([JSONY(meta)], { type: 'application/json' })
        FileSaver.saveAs(blob, `${btf.name}_full.json`)
    }

    @action
    handleBrush (event: any) {
        this.brushRadius = parseInt(event.target.value, 10)
    }
}

const { Plugin: PaintPlugin, Component } = PluginCreator(PaintController, PaintModel, 'PaintPlugin')
export default PaintPlugin
export type IPaintPlugin = typeof PaintPlugin.Type

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
            <Button onClick={this.addLayer}>+Layer</Button>
            <TextField
                label=''
                value={this.brushRadius}
                onChange={this.handleBrush}
                type='number'
                InputLabelProps={{
                    shrink: true,
                }}
                margin='normal'
            />
            <Button style={{
                backgroundColor: this.displayColor(),
                color: this.displayColor(true),
                textShadow: this.color[3] < 0.3 ? '1px 1px 1px black' : '',
            }} onClick={this.switchColorPicker}>Color</Button>
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

/**
 * Actual painting node inside the render stack
 */
const PaintNode = Component(function PaintNode (props) {
    let btf = props.appState.btf()
    let width = btf.data.width
    let height = btf.data.height
    let mix = Math.sqrt(width * width + height * height)
    let brush = this.brushRadius / mix / 2
    // just render the input texture if we got no other layers to put on top
    if (this.layers.length === 0)
        return <Node
            ref={this.handleRef('mixer')}
            width={width}
            height={height}
            key={this.key}
            shader={{
                frag: initShader,
            }}
            uniforms={{
                children: props.children,
            }} />
    else
        // return one mixer node, which stiches the underlying rendered object and the annotations together
        return <Node
            ref={this.handleRef('mixer')}
            width={width}
            height={height}
            key={this.key}
            onDraw={this.onDraw}
            shader={{
                frag: this.mixerShader(),
            }}
            uniforms={{
                children: props.children,
                layerVisibility: this.layers.map(l => l.visible),
                center: this.center.slice(0, 3),
                brushRadius: brush,
                showBrush: this.drawing === DrawingState.Hovering,
            }}
        >
            {// map all layers into the `layer` uniform of the mixer shader
                this.layers.map((layer, index) => {
                    let drawThis = this.drawing === DrawingState.Drawing && this.activeLayer === index
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
                                    drawing: drawThis,
                                    color: drawThis ? this.color.slice(0, 4) : [0, 0, 0, 0],
                                    center: drawThis ? this.center.slice(0, 3) : [0, 0],
                                    brushRadius: drawThis ? brush : 0,
                                } : {
                                        // clear is null, so we initially grap the loaded texture
                                        children: btf.annotationTexForRender(layer.id),
                                    }} />
                    </Bus>
                })}
        </Node >
})

const Fullshot = Component(function Fullshot (props) {
    return <Button onClick={this.fullshot}>Fullshot</Button>
})
