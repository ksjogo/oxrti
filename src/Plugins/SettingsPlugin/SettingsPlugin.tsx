// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { Card, CardContent, List, ListItem, Theme, createStyles, Typography } from '@material-ui/core'
import JSONDisplay from '../../View/JSONDisplay'
// oxrti default imports ->

const SettingsModel = Plugin.props({
    title: 'Settings',
})

class SettingsController extends shim(SettingsModel, Plugin) {
    hooks () {
        return {
            Tabs: {
                Converter: {
                    priority: 0,
                    content: SettingsView,
                    tab: {
                        label: 'Settings',
                    },
                },
            },
        }
    }
}

const { Plugin: SettingsPlugin, Component } = PluginCreator(SettingsController, SettingsModel, 'SettingsPlugin')
export default SettingsPlugin
export type ISettingsPlugin = typeof SettingsPlugin.Type

const styles = (theme: Theme) => createStyles({
    pluginCard: {
        width: '100%',
    },
})

const SettingsView = Component(function SettingsView (props, classes) {
    let plugins = Array.from(props.appState.plugins.entries()).sort(([nameA], [nameB]) => {
        return nameA.localeCompare(nameB)
    })
    let rendered = plugins.map(([name, controller]) => {
        return <ListItem>
            <Card className={classes.pluginCard}>
                <CardContent>
                    {name}
                    <JSONDisplay json={
                        (controller as any).toJSON()
                    } />
                </CardContent>
            </Card>
        </ListItem>
    })

    return < Card >
        <CardContent>
            <Typography>Uptime: {props.appState.uptime}</Typography>
            <Typography></Typography>
            <Typography> Loaded Plugins: </Typography>
            <List>
                {rendered}
            </List>
        </CardContent>
    </Card >
}, styles)
