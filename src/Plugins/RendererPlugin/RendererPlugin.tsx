import React from 'react'
import { AppStyles, DrawerWidth } from '../BaseThemePlugin/BaseThemePlugin'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders, LinearCopy } from 'gl-react'
import Measure, { ContentRect } from 'react-measure'
import { Theme, createStyles, Button, Drawer, Popover, Card, CardContent, CardActions, List, ListItem, Typography } from '@material-ui/core'
import { Registrator as OxrtiTextureRegistrator } from '../../loaders/oxrtidatatex/OxrtiDataTextureLoader'
import Dropzone from 'react-dropzone'
import { BTFMetadataConciseDisplay, Tooltip } from '../BasePlugin/BasePlugin'
import { readAsArrayBuffer } from 'promise-file-reader'
import { fromZip } from '../../BTFFile'
import { Point, sleep, JSONY } from '../../Util'
import uniqid from 'uniqid'
import FileSaver from 'file-saver'
import { Surface } from 'gl-react-dom'

const RendererModel = Plugin.props({
})

class RendererController extends shim(RendererModel, Plugin) {
    popover = ''
    elementHeight = -1
    elementWidth = -1
    key = ''

    load (appState: any) {
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
                    tooltip: 'Download BTF',
                    text: 'BTF',
                    action: this.download,
                    priority: 100,
                },
                Screenshot: {
                    priority: 90,
                    tooltip: 'Export Screenshot of current view window',
                    text: 'Snapshot',
                    action: this.exportScreenshot,
                },
            },
            ActionBar: {
                Open: {
                    priority: 10,
                    onClick: () => this.ref('dropzone').open(),
                    title: 'Open',
                    enabled: () => true,
                    tooltip: 'Load a .btf.zip file',
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
        console.log('on resize')
    }

    onResizeHandler (contentRect: ContentRect) {
        if (Math.abs(this.elementHeight - Math.floor(contentRect.bounds.height)) + Math.floor(Math.abs(this.elementWidth - contentRect.bounds.width)) > 3)
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
        let content = await readAsArrayBuffer(file)
        this.showPopover('Parsing Zip')
        let btf = await fromZip(content)
        this.showPopover()
        await sleep(0)
        this.appState.loadFile(btf, true)
    }

    dragging = false
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
        this.lastDragScreen = null
        this.lastDragTex = null
        this.notifyDraggers(e)
    }

    @action
    onMouseUp (e: MouseEvent) {
        this.dragging = false
        this.notifyDraggers(e)
    }

    centerRef: any
    handleCenterRef (measureRef: any) {
        return (ref: any) => {
            if (this.centerRef !== ref) {
                this.centerRef = ref
                measureRef(ref)
            }
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
        let meta: { [key: string]: any } = {}
        this.appState.hookForEach('ScreenshotMeta', (hook) => {
            if (hook.snapshot)
                meta[hook.key] = hook.snapshot()
        })
        blob = new Blob([JSONY(meta)], { type: 'application/json' })
        FileSaver.saveAs(blob, `${btf.name}_snap.json`)
    }

    async download () {
        this.appState.hookForEach('PreDownload')
        let btf = this.appState.btf()
        let zip = await btf.generateZip()
        FileSaver.saveAs(zip, btf.zipName())
    }

    inhibitTooltips: boolean = null
    actionWrapper (action: () => Promise<void>) {
        return async () => {
            await action()
            this.setInhibitTooltips(true)
            await sleep(0)
            this.setInhibitTooltips(null)
        }
    }

    @action
    setInhibitTooltips (value: boolean) {
        this.inhibitTooltips = value
    }
}

const { Plugin: RendererPlugin, Component } = PluginCreator(RendererController, RendererModel, 'RendererPlugin')
export default RendererPlugin
export type IRendererPlugin = typeof RendererPlugin.Type

const RendererView = Component(function RendererView (props, classes) {
    return <div className={classes.container}>
        <Measure bounds onResize={this.onResizeHandler}>
            {({ measureRef }) =>
                <div ref={this.handleCenterRef(measureRef)} className={classes.content}>
                    <div className={classes.stack}>
                        {this.elementHeight !== -1 && <Stack
                            key={this.key}
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
            <Tooltip title='Load a .btf.zip file'>
                <Dropzone ref={this.handleRef('dropzone')} onDrop={this.onDrop} className={classes.dropzone}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
            </Tooltip>
        </CardContent>
        <CardActions>{
            this.appState.hookMap('ViewerFileAction', (hook, fullName) => {
                let button = <Button key={fullName} onClick={this.actionWrapper(hook.action)}>{hook.text}</Button>
                return this.inhibitTooltips ? button :
                    <Tooltip key={fullName} title={hook.tooltip}>
                        {button}
                    </Tooltip>
            })
        }
        </CardActions>
    </Card>
}, UploadStyles)

import noise from './noise.glsl'
import { ILightControlPlugin } from '../LightControlPlugin/LightControlPlugin'
const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
})

const styles = () => createStyles({
    surface: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
    },
})

const Stack = Component(function Stack (props, classes) {
    let size = Math.min(this.elementHeight, this.elementWidth)
    let marginXP = this.elementWidth > this.elementHeight
    let margin = Math.abs((this.elementHeight - this.elementWidth) / 2)

    let current: JSX.Element
    let btf = props.appState.btf()

    let lightControl = this.appState.plugins.get('LightControlPlugin') as ILightControlPlugin

    if (!btf.isDefault()) {
        /** %beingPicker */
        props.appState.hookForEach('RendererForModel', (Hook) => {
            if (Hook.channelModel === btf.data.channelModel) {
                current = <Hook.node
                    key={btf.id}
                    lightPos={lightControl.lightPos}
                />
            }
        })
        /** %endPicker */
    }
    if (!current) {
        current = <Node
            key={btf.id}
            height={size}
            width={size}
            shader={shaders.noise}
            uniforms={{ iGlobalTime: props.appState.uptime }}
        />
    }

    /** %beingWrapper */
    props.appState.hookForEach('ViewerRender', (Hook) => {
        current = <Hook.component
            key={btf.id}
        >{current}</Hook.component>
    })
    /** %endWrapper */

    return <div style={{
        marginLeft: marginXP ? margin : 0,
        marginTop: !marginXP ? margin : 0,
    }}>
        <Surface
            ref={this.handleRef('surface')}
            className={classes.surface}
            height={size}
            width={size}
            onMouseLeave={this.onMouseLeave}
            onMouseMove={this.onMouseMove}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            webglContextAttributes={{ preserveDrawingBuffer: true }}
        ><LinearCopy>
                {current}
            </LinearCopy>
        </Surface>
    </div>
}, styles)
