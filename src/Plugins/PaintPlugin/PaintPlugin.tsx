// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->

import { Point, DummyRenderSize } from '../../Math'
import { Switch, Theme, createStyles } from '@material-ui/core'

import paintShader from './paint.glsl'
import mixerShader from './mixer.glsl'
import { observable } from 'mobx'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import TrashIcon from '@material-ui/icons/Delete'

const PaintModel = Plugin.props({
    title: 'Paint',
    color: types.optional(types.array(types.number), observable.array([1, 0, 0, 1])),
    center: types.optional(types.array(types.number), observable.array([0.5, 0.5])),
    brushRadius: 5,
    activeLayer: -1,
    layersVisible: types.optional(types.array(types.boolean), observable.array([true, true, true])),
})

class PaintController extends shim(PaintModel, Plugin) {
    drawing = false

    layerCount () {
        return this.layersVisible.length
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
        }
    }

    @action
    beforeFocusGain () {
        console.log('before gain')
    }

    @action
    beforeFocusLose () {
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
        this.layersVisible[index] = value
    }

    handleVisibility (index) {
        return (event, value) => {
            this.setVisibility(index, value)
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

const PaintUI = Component(function PaintUI (props, classes) {
    return <div>
        <h3>Paint</h3>
        <List>
            {this.layersVisible.map((visible, index) => (
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
                            checked={visible}
                        />
                        {/* <IconButton aria-label='Trash'>
                            <TrashIcon />
                        </IconButton> */}
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    </div>
}, styles)

import { Shaders, Node, GLSL, Bus } from 'gl-react'

const PaintNode = Component(function PaintNode (props) {
    let btf = props.appState.btf()
    let width = btf ? btf.data.width : DummyRenderSize
    let height = btf ? btf.data.height : DummyRenderSize
    let brush = this.brushRadius / width
    return <Node
        shader={{
            // we need to recompile the shader for different layer amounts
            frag: mixerShader.replace(/\[X\]/gi, `[${this.layerCount()}]`).replace('< layerCount', `< ${this.layerCount()}`),
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
                return <Bus uniform={'layer'} key={`layer${index}`} index={index} >
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
