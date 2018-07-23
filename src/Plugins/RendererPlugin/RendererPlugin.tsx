// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'
import RenderHooks from '../../View/RenderHooks'

const RendererModel = Plugin.props({
    title: 'Renderer',
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
        }
    }
}

const { Plugin: RendererPlugin, Component } = PluginCreator(RendererController, RendererModel, 'RendererPlugin')
export default RendererPlugin

const RendererView = Component(function RendererView (props) {
    return <Grid container spacing={16}>
        <Grid item xs={8}>
            <Stack />
        </Grid>
        <Grid item xs={4}>
            <h1>Oxrti</h1>
            <p>Uptime: {props.appState.uptime}</p>
            <RenderHooks name='ViewerSide' />
        </Grid>
    </Grid>
})
