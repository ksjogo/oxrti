// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'
import Measure, { ContentRect } from 'react-measure'
import { Theme, createStyles, Divider, Paper, Drawer, Card, CardContent, CardActions, List, ListItem } from '@material-ui/core'
import { Registrator as OxrtiTextureRegistrator } from '../../loaders/oxrtidatatex/OxrtiDataTextureLoader'
import Dropzone from 'react-dropzone'
import { BTFMetadataConciseDisplay } from '../../View/JSONDisplay'
import { readAsArrayBuffer } from 'promise-file-reader'
import { fromZip } from '../../BTFFile'
import { DraggerConfig, ViewerTabFocusHook, ComponentHook, ConfigHook, RendererHook } from '../../Hook'
import { Point } from '../../Math'
import DownloadBTF from '../../View/DownloadBTF'

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
                Renderer: {
                    padding: 0,
                    priority: 120,
                    content: RendererView,
                    tab: {
                        label: 'Viewer',
                    },
                    beforeFocusGain: this.beforeFocusGain,
                    beforeFocusLose: this.beforeFocusLose,
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
    async beforeFocusGain () {
        this.appState.asyncHookForEach('ViewerTabFocus', async (config: ViewerTabFocusHook) => {
            config.beforeGain && await config.beforeGain()
        })
    }

    @action
    async beforeFocusLose () {
        this.appState.asyncHookForEach('ViewerTabFocus', async (config: ViewerTabFocusHook) => {
            config.beforeLose && await config.beforeLose()
        })
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
            return alert('Only .btf.zip is supported. Please use the converter before.')
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

        this.appState.hookForEach('ViewerDrag', (hook: ConfigHook<DraggerConfig>) => {
            return hook.dragger(this.lastDragTex, nextTex, this.lastDragScreen, nextScreen)
        })

        this.lastDragScreen = nextScreen
        this.lastDragTex = nextTex
    }

    @action
    onMouseLeave () {
        this.dragging = false
        this.appState.hookForEach('ViewerDrag', (hook: ConfigHook<DraggerConfig>) => {
            return hook.draggerLeft && hook.draggerLeft()
        })
    }

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

import AppStyles, { DrawerWidth } from '../../View/AppStyles'

const RendererView = Component(function RendererView (props, classes) {
    return <div className={classes.container}>
        <Measure bounds onResize={this.onResize.bind(this)}>
            {({ measureRef }) =>
                <div ref={measureRef} className={classes.content}>
                    <div className={classes.stack}>
                        <Stack
                            onMouseLeave={this.onMouseLeave}
                            onMouseMove={this.onMouseMove}
                            onMouseDown={this.onMouseDown}
                            onMouseUp={this.onMouseUp}
                        />
                    </div>
                </div>
            }
        </Measure>
        <Drawer
            anchor='right'
            variant='permanent'
            className={`${classes.drawer} fixDrawer`}
        >
            <div className={classes.toolbar} />
            <List>
                {props.appState.hookMap('ViewerSide', (hook: ComponentHook, fullName: string) => {
                    let Func = hook.component
                    return <ListItem key={fullName} >
                        <Func />
                    </ListItem>
                })}
            </List>
        </Drawer>
    </div>

}, AppStyles)

const UploadStyles = (theme: Theme) => createStyles({
    dropzone: {
        border: '1px solid ' + theme.palette.primary.main,
        width: '100%',
        height: '50px',
    },
})

const Upload = Component(function Upload (props, classes) {
    return <Card>
        <CardContent>
            <Dropzone onDrop={this.onDrop} className={classes.dropzone}>
                <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
        </CardContent>
        <CardActions>
            <DownloadBTF />
        </CardActions>
    </Card>
}, UploadStyles)
