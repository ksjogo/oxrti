import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Surface } from 'gl-react-dom'
import { Theme, createStyles, Card, CardContent } from '@material-ui/core'
import { SafeGLIInspector, Tooltip } from '../BasePlugin/BasePlugin'
import { Node } from 'gl-react'
import { normalize, sub, Point, rotate, Node2PNG } from '../../Util'
import { IZoomPlugin } from '../ZoomPlugin/ZoomPlugin'
import FileSaver from 'file-saver'
import ndarray from 'ndarray'

const QuickPanModel = Plugin.props({
})

class QuickPanController extends shim(QuickPanModel, Plugin) {
    grabTreshold = false
    grabNext = true

    load (appState: IAppState) {
        super.load(appState)
    }

    get hooks () {
        return {
            ViewerSide: {
                Rotation: {
                    component: QuickPanComponent,
                    priority: 80,
                },
            },
            ViewerRender: {
                Grabber: {
                    priority: 100000,
                    component: Grabber,
                },
            },
            PostLoad: {
                Grabber: {
                    func: this.enableGrabNext,
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

    get widthHeight () {
        let btf = this.appState.btf()
        // keep aspect ratio
        let width = SIZE
        let height = Math.floor(150 * btf.data.height / btf.data.width)
        return [width, height]
    }

    grabberNode: any = null
    quickPanPreview: TexForRender = null

    @action
    handleGrabberRef (node: any) {
        this.grabberNode = node
    }

    @action
    handleGrabberDraw () {
        if (this.grabNext && this.appState.loadingTextures === 0 && this.grabberNode) {
            let btf = this.appState.btf()
            let [width, height] = this.widthHeight
            let data = Node2PNG(this.grabberNode, width, height, true)
            this.quickPanPreview = {
                type: 'oxrti',
                data: data,

                width: width,
                height: height,
                ident: `${btf.name}_preview`,
                format: 'PNG32',
            }
            this.grabNext = false
        }
    }

    @action
    enableGrabNext () {
        this.grabNext = true
        this.quickPanPreview = null
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

import quickPanShader from './quickpan.glsl'
import grabberShader from './grabber.glsl'
import { TexForRender } from '../../BTFFile'
import { IAppState } from '../../AppState'

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
                    {this.quickPanPreview}
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

const Grabber = Component(function Grabber (props) {
    let [width, height] = this.widthHeight
    if (!this.grabNext)
        return React.Children.only(props.children)
    return <Node
        width={width}
        height={height}
        ref={this.handleGrabberRef}
        onDraw={this.handleGrabberDraw}
        shader={{
            frag: grabberShader,
        }}
        uniforms={{
            children: props.children,
        }}
    />
})
