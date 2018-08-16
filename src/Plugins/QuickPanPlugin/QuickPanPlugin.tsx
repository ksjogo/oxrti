import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { Surface } from 'gl-react-dom'
import { Typography, Theme, createStyles, Card, CardContent } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import SafeGLIInspector from '../../View/SafeGLIInspector'
import { LinearCopy, Node } from 'gl-react'

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

const QuickPanComponent = Component(function QuickPanComponent (props) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <SafeGLIInspector>
                <PreviewComponent />
            </SafeGLIInspector>
        </CardContent>
    </Card>
})

import noise from '../RendererPlugin/noise.glsl'
import quickPanShader from './quickpan.glsl'
import { normalize, sub, Point, rotate } from '../../Math'
import { IZoomPlugin } from '../ZoomPlugin/ZoomPlugin'

const SIZE = 150

const PreviewComponent = Component(function PreviewComponent (props, classes) {
    let btf = props.appState.btf()
    let width = SIZE
    let height = 150 * btf.data.height / btf.data.width
    let rootnode
    if (!btf.isDefault()) {
        props.appState.hookForEach('RendererForModel', (hook) => {
            if (hook.channelModel === btf.data.channelModel) {
                let Func = hook.node.render
                rootnode = <Func
                    key={btf.id}
                    height={height}
                    width={width}
                    lightPos={normalize([0.00001, -0.00001, 1])}
                />
            }
        })
    } else {
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

    let A = this.inversePoint([0, 0])
    let B = this.inversePoint([0, 1])
    let C = this.inversePoint([1, 1])
    let D = this.inversePoint([1, 0])

    return <div style={{
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
            <RectRenderNode
                A={A}
                B={B}
                C={C}
                D={D}
            >
                {rootnode}
            </RectRenderNode>
        </Surface>
    </div>
}, styles)

export const RectRenderNode = Component<{
    A: Point,
    B: Point,
    C: Point,
    D: Point,
}>(function RectRenderNode (props) {
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
