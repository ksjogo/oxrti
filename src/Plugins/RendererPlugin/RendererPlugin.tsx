import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders } from 'gl-react'
import { types } from 'mobx-state-tree'
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'
import Measure, { ContentRect } from 'react-measure'
import { Theme, createStyles, Button, Divider, Paper, Drawer, Popover, Card, CardContent, CardActions, List, ListItem, Typography } from '@material-ui/core'
import { Registrator as OxrtiTextureRegistrator } from '../../loaders/oxrtidatatex/OxrtiDataTextureLoader'
import Dropzone from 'react-dropzone'
import { BTFMetadataConciseDisplay } from '../../View/JSONDisplay'
import { readAsArrayBuffer } from 'promise-file-reader'
import { fromZip } from '../../BTFFile'
import { Point } from '../../Math'
import DownloadBTF from '../../View/DownloadBTF'
import uniqid from 'uniqid'
import FileSaver from 'file-saver'

const RendererModel = Plugin.props({
})

class RendererController extends shim(RendererModel, Plugin) {
    popover = ''
    elementHeight = -1
    elementWidth = -1
    key = ''

    load (appState) {
        super.load(appState)
        OxrtiTextureRegistrator(appState)
    }

    get hooks () {
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
                    priority: -110,
                },
                Open: {
                    component: Upload,
                    priority: 100,
                },
            },
            ViewerFileAction: {
                DownloadBTF: {
                    component: DownloadBTF,
                    priority: 100,
                },
                Screenshot: {
                    priority: 90,
                    component: Component(() => <Button onClick={this.exportScreenshot}>Snapshot</Button>),
                },
            },
        }
    }

    hotUnload () {
        console.log('Renderer Hot Unload')
        this.appState.hookForEach('PreDownload')
    }

    hotReload () {
        console.log('Renderer Hot Load')
        this.appState.hookForEach('PostLoad')
    }

    @action
    async beforeFocusGain () {
        this.appState.asyncHookForEach('ViewerTabFocus', async (config) => {
            config.beforeGain && await config.beforeGain()
        })
    }

    @action
    async beforeFocusLose () {
        this.appState.asyncHookForEach('ViewerTabFocus', async (config) => {
            config.beforeLose && await config.beforeLose()
        })
    }

    @action
    onResize (contentRect: ContentRect) {
        this.elementHeight = Math.floor(contentRect.bounds.height)
        this.elementWidth = Math.floor(contentRect.bounds.width)
    }

    onResizeHandler (contentRect: ContentRect) {
        if (this.elementHeight !== contentRect.bounds.height || this.elementWidth !== contentRect.bounds.width)
            this.onResize(contentRect)
    }

    @action
    flushBuffers () {
        this.key = uniqid()
    }

    @action
    async onDrop (files: File[]) {
        this.showPopover('Reading File')
        await sleep(0)
        let file = files[0]
        if (!file.name.endsWith('.btf.zip')) {
            this.showPopover()
            return alert('Only .btf.zip is supported. Please use the converter before.')
        }
        let content = await readAsArrayBuffer(file) as ArrayBuffer
        this.showPopover('Parsing Zip')
        let btf = await fromZip(content)
        this.showPopover()
        await sleep(0)
        this.appState.loadFile(btf, true)
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

        nextTex = this.inversePoint(nextTex)

        this.appState.hookForEach('ViewerMouse', (hook) => {
            return hook.listener(this.lastDragTex, nextTex, this.lastDragScreen, nextScreen, this.dragging)
        })

        this.lastDragScreen = nextScreen
        this.lastDragTex = nextTex
    }

    inversePoint (point: Point) {
        this.appState.hookForEachReverse('ViewerRender', (hook) => {
            if (hook.inversePoint)
                point = hook.inversePoint(point)
        })
        return point
    }

    @action
    onMouseLeave () {
        this.dragging = false
        this.appState.hookForEach('ViewerMouse', (hook) => {
            return hook.mouseLeft && hook.mouseLeft()
        })
    }

    onMouseMove (e: MouseEvent) {
        this.notifyDraggers(e)

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
    onMouseUp (e: MouseEvent) {
        this.dragging = false
        this.notifyDraggers(e)
    }

    centerRef
    handleCenterRef (measureRef) {
        return (ref) => {
            this.centerRef = ref
            measureRef(ref)
        }
    }

    @action
    showPopover (text?: string) {
        this.popover = text ? text : ''
    }

    get popoverShown () {
        return this.popover !== '' || this.appState.loadingTextures > 0
    }

    get popoverText () {
        return this.popover !== '' ? this.popover : `Loading ${this.appState.loadingTextures} textures`
    }


    async exportScreenshot () {
        let btf = this.appState.btf()
        let blob = await (this.ref('surface').captureAsBlob() as Promise<Blob>)
        FileSaver.saveAs(blob, `${btf.name}_snap.png`)
        let meta = {}
        this.appState.hookForEach('ScreenshotMeta', (hook) => {
            if (hook.snapshot)
                meta[hook.key] = hook.snapshot()
        })
        blob = new Blob([JSONY(meta)], { type: 'application/json' })
        FileSaver.saveAs(blob, `${btf.name}_snap.json`)
    }
}

const { Plugin: RendererPlugin, Component } = PluginCreator(RendererController, RendererModel, 'RendererPlugin')
export default RendererPlugin
export type IRendererPlugin = typeof RendererPlugin.Type

import AppStyles, { DrawerWidth } from '../../View/AppStyles'
import content from '*.css'
import { sleep, JSONY } from '../../util'
import RenderHooks from '../../View/RenderHooks'

const RendererView = Component(function RendererView (props, classes) {
    return <div className={classes.container}>
        <Measure bounds onResize={this.onResizeHandler}>
            {({ measureRef }) =>
                <div ref={this.handleCenterRef(measureRef)} className={classes.content}>
                    <div className={classes.stack}>
                        {this.elementHeight !== -1 && <Stack
                            key={this.key}
                            surfaceRef={this.handleRef('surface')}
                            onMouseLeave={this.onMouseLeave}
                            onMouseMove={this.onMouseMove}
                            onMouseDown={this.onMouseDown}
                            onMouseUp={this.onMouseUp}
                        />}
                    </div>
                </div>
            }
        </Measure>
        <Popover
            style={{
                backgroundColor: 'rgb(0.5,0.5,0.5,0.5)',
            }}
            anchorEl={this.centerRef}
            open={this.popoverShown}
            anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'center',
                horizontal: 'center',
            }}
        >
            <Typography>{this.popoverText}</Typography>
        </Popover>
        <Drawer
            anchor='right'
            variant='permanent'
            className={classes.drawer}
            PaperProps={{
                style: {
                    width: `${DrawerWidth}px`,
                },
            }}
        >
            <div className={classes.toolbar} />
            <List>
                {props.appState.hookMap('ViewerSide', (hook, fullName) => {
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
            <RenderHooks name='ViewerFileAction' />
        </CardActions>
    </Card>
}, UploadStyles)
