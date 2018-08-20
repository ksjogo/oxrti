import React, { ReactText } from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import Typography from '@material-ui/core/Typography'
import { AppStyles } from '../BaseThemePlugin/BaseThemePlugin'

const SingleViewModel = Plugin.props({
})

class SingleViewController extends shim(SingleViewModel, Plugin) {
    get hooks () {
        return {
            AppView: {
                SingleView: {
                    priority: 100,
                    component: SingleView,
                },
            },
        }
    }
}

const { Plugin: SingleViewPlugin, Component } = PluginCreator(SingleViewController, SingleViewModel, 'SingleViewPlugin')
export default SingleViewPlugin
export type ISingleViewPlugin = typeof SingleViewPlugin.Type

const SingleView = Component(function App (props, classes) {
    let CurrentTab = this.appState.hookPick('Tabs', 0)
    let padding = CurrentTab.padding !== undefined ? CurrentTab.padding : 24
    return <div>
        <Typography component='div' style={{ padding: padding }}>
            <CurrentTab.content />
        </Typography>
    </div>
}, AppStyles)
