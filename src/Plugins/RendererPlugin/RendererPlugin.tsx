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
import { BTFMetadataDisplay } from '../../View/JSONDisplay'

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
                    component: BTFMetadataDisplay,
                    priority: 0,
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
    onDrop (files: File[]) {
        //
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
                        paddingBottom: aspect,
                    }}>
                        <Stack />
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
