// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'
import RenderHooks from '../../View/RenderHooks'
import Measure, { ContentRect } from 'react-measure'
import { Theme, createStyles } from '@material-ui/core'
import OxrtiDataTextureLoader, { Registrator } from '../../loaders/oxrtidatatex/OxrtiDataTextureLoader'
import { BTFMetadataDisplay } from '../../View/JSONDisplay'
Registrator()

const RendererModel = Plugin.props({
    title: 'Renderer',
    elementHeight: 300,
    elementWidth: 300,
})

class RendererController extends shim(RendererModel, Plugin) {
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
            },
        }
    }

    @action
    onResize (contentRect: ContentRect) {
        this.elementHeight = contentRect.bounds.height
        this.elementWidth = contentRect.bounds.width
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
