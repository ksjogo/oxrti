import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Surface } from 'gl-react-dom'
import { Theme, createStyles, Card, CardContent } from '@material-ui/core'
import { SafeGLIInspector, Tooltip } from '../BasePlugin/BasePlugin'
import { Node } from 'gl-react'

const QuickPanModel = Plugin.props({
})

class QuickPanController extends shim(QuickPanModel, Plugin) {
    get hooks () {
        return {
            ViewerSide: {
                Rotation: {
                    component: QuickPanComponent,
                    priority: 80,
                },
            },
        }
    }

    dragging = false
    /**
     * Update the viewer position due to quick pan movements
     * Requries the zoom plugin
     */
    @action
    updatePosition (e: MouseEvent) {
        let rect = (e.target as any).getBoundingClientRect()
        let x = (e.clientX - rect.left) / (rect.width)
        let y = (rect.bottom - e.clientY) / (rect.height)
        let target: Point = [x, y]
        this.panner.zoomOnPoint(target)
    }

    get panner () {
        let zoomer = this.appState.plugins.get('ZoomPlugin') as IZoomPlugin
        return zoomer
    }

    @action
    onMouseLeave () {
        this.dragging = false
    }

    onMouseMove (e: MouseEvent) {
        if (this.dragging) {
            this.updatePosition(e)
        }
    }

    @action
    onMouseDown (e: MouseEvent) {
        this.dragging = true
        this.updatePosition(e)
    }

    @action
    onMouseUp () {
        this.dragging = false
    }
}

const { Plugin: QuickPanPlugin, Component } = PluginCreator(QuickPanController, QuickPanModel, 'QuickPanPlugin')
export default QuickPanPlugin
export type IQuickPanPlugin = typeof QuickPanPlugin.Type

const styles = (theme: Theme) => createStyles({
    dragger: {
    },
})

/**
 * Wrapped QuickPan Preview
 */
const QuickPanComponent = Component(function QuickPanComponent (props) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <SafeGLIInspector>
                <QuickPan />
            </SafeGLIInspector>
        </CardContent>
    </Card>
})

import noise from '../RendererPlugin/noise.glsl'
import quickPanShader from './quickpan.glsl'
import { normalize, sub, Point, rotate } from '../../Util'
import { IZoomPlugin } from '../ZoomPlugin/ZoomPlugin'

const SIZE = 150

/**
 * QuickPan surface
 * Will show a non-rotated/scaled/panned version of the current base rendering function.
 * Renders a rect of the current viewing settings on top.
 */
const QuickPan = Component(function QuickPan (props, classes) {
    let btf = props.appState.btf()
    // keep aspect ratio
    let width = SIZE
    let height = 150 * btf.data.height / btf.data.width
    let rootnode
    if (!btf.isDefault()) {
        // pick the current base rendering function
        props.appState.hookForEach('RendererForModel', (hook) => {
            if (hook.channelModel === btf.data.channelModel) {
                let Func = hook.node
                rootnode = <Func
                    key={btf.id}
                    height={height}
                    width={width}
                    lightPos={normalize([0.00001, -0.00001, 1])/*TOFIX: Why is it black without*/}
                />
            }
        })
    } else {
        // render the noise shader
        // beaware that it will render differently due to different uv behaviour
        // it is not actual preview
        rootnode = <Node
            height={height}
            width={width}
            shader={{
                frag: noise,
            }}
            uniforms={{
                iGlobalTime: props.appState.uptime,
            }} />
    }

    // transform view coordinates into texture coordinates
    // these then are used to render the semi-transparent rect on top
    let A = this.inversePoint([0, 0])
    let B = this.inversePoint([0, 1])
    let C = this.inversePoint([1, 1])
    let D = this.inversePoint([1, 0])

    return <Tooltip title='Drag around'>
        <div style={{
            marginLeft: `calc(50% - ${SIZE / 2}px)`,
        }}>
            <Surface
                className={classes.dragger}
                width={width}
                height={height}
                onMouseLeave={this.onMouseLeave}
                onMouseMove={this.onMouseMove}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}>
                <RectRender
                    A={A}
                    B={B}
                    C={C}
                    D={D}
                >
                    {rootnode}
                </RectRender>
            </Surface>
        </div>
    </Tooltip>
}, styles)

/**
 * Render a generic transparent rect on top of children.
 * Pass A,B,C,D of that rect as texture coordinates.
 */
export const RectRender = Component<{
    A: Point,
    B: Point,
    C: Point,
    D: Point,
}>(function RectRender (props) {
    return <Node
        shader={{
            frag: quickPanShader,
        }}
        uniforms={{
            A: props.A,
            B: props.B,
            C: props.C,
            D: props.D,
            children: props.children,
        }}>
    </Node>
})
