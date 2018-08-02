// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'
import RenderHooks from '../../View/RenderHooks'
import Measure, { ContentRect } from 'react-measure'
import { Theme, createStyles, Typography } from '@material-ui/core'
import { Registrator as OxrtiTextureRegistrator } from '../../loaders/oxrtidatatex/OxrtiDataTextureLoader'
import Dropzone from 'react-dropzone'
import { BTFMetadataDisplay, BTFMetadataConciseDisplay } from '../../View/JSONDisplay'
import { readAsArrayBuffer } from 'promise-file-reader'
import { fromZip } from '../../BTFFile'
import { Dragger } from './DragInterface'
import { FunctionHook, RendererHooks, RendererHook } from '../../Hook'
import { Point } from '../../Math'

const RendererModel = Plugin.props({
    title: 'Renderer',
    elementHeight: 300,
    elementWidth: 300,
})

class RendererController extends shim(RendererModel, Plugin) {
    load (appState) {
        super.load(appState)
        OxrtiTextureRegistrator(appState)
    }

    hooks () {
        return {
            Tabs: {
                Converter: {
                    priority: 20,
                    content: RendererView,
                    tab: {
                        label: 'Viewer',
                    },
                },
            },
            ViewerSide: {
                Metadata: {
                    component: BTFMetadataConciseDisplay,
                    priority: 110,
                },
                Open: {
                    component: Upload,
                    priority: 100,
                },
            },
        }
    }

    @action
    onResize (contentRect: ContentRect) {
        this.elementHeight = contentRect.bounds.height
        this.elementWidth = contentRect.bounds.width
    }

    @action
    async onDrop (files: File[]) {
        let file = files[0]
        if (!file.name.endsWith('.btf.zip'))
            return alert('Only .btf.zip is supported.')
        let content = await readAsArrayBuffer(file) as ArrayBuffer
        let btf = await fromZip(content)
        this.appState.loadFile(btf)
    }

    dragging = false
    lastDragTime = null
    lastDragTex: Point = null
    lastDragScreen: Point = null
    @action
    notifyDraggers (e: MouseEvent) {
        let rect = (e.target as any).getBoundingClientRect()
        let newU = (e.clientX - rect.left) / (rect.width)
        let newV = (rect.bottom - e.clientY) / (rect.height)
        let nextScreen: Point = [newU, newV]
        let nextTex = nextScreen

        this.appState.hookForEachReverse('ViewerRender', (hook: RendererHook) => {
            if (hook.inversePoint)
                nextTex = hook.inversePoint(nextTex)
        })

        this.appState.hookForEach('ViewerDrag', (hook: FunctionHook<Dragger>) => {
            return hook.func(this.lastDragTex, nextTex, this.lastDragScreen, nextScreen)
        })

        this.lastDragScreen = nextScreen
        this.lastDragTex = nextTex
    }

    @action
    onMouseLeave () {
        this.dragging = false
    }

    @action
    onMouseMove (e: MouseEvent) {
        if (this.dragging) {
            this.notifyDraggers(e)
        }
    }

    @action
    onMouseDown (e: MouseEvent) {
        this.dragging = true
        this.lastDragTime = new Date()
        this.lastDragScreen = null
        this.lastDragTex = null
        this.notifyDraggers(e)
    }

    @action
    onMouseUp () {
        this.dragging = false
    }
}

const { Plugin: RendererPlugin, Component } = PluginCreator(RendererController, RendererModel, 'RendererPlugin')
export default RendererPlugin
export type IRendererPlugin = typeof RendererPlugin.Type

const styles = (theme: Theme) => createStyles({
    stack: {
        width: '100%',
        height: 0,
        'padding-bottom': '100%',
    },
    dropzone: {
        border: '1px solid ' + theme.palette.primary.main,
        width: '100%',
        height: '50px',
    },
})

const RendererView = Component(function RendererView (props, classes) {
    let aspect = props.appState.btf() ? `${100 / props.appState.btf().aspectRatio()}%` : '100%'
    return <Grid container spacing={16}>
        <Grid item xs={8}>
            <Measure bounds onResize={this.onResize.bind(this)}>
                {({ measureRef }) =>
                    <div ref={measureRef} className={classes.stack} style={{
                        // paddingBottom: aspect,
                    }}>
                        <Stack
                            onMouseLeave={this.onMouseLeave}
                            onMouseMove={this.onMouseMove}
                            onMouseDown={this.onMouseDown}
                            onMouseUp={this.onMouseUp}
                        />
                    </div>
                }
            </Measure>
        </Grid>
        <Grid item xs={4}>
            <RenderHooks name='ViewerSide' />
        </Grid>
    </Grid>
}, styles)

const Upload = Component(function Upload (props, classes) {
    return <div>
        <h3>Open</h3>
        <Dropzone onDrop={this.onDrop} className={classes.dropzone}>
            <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
    </div>

}, styles)
