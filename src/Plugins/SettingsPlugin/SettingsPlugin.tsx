import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim } from 'classy-mst'
import { Card, CardContent, List, ListItem, Theme, createStyles, Typography, ListItemText, ListItemSecondaryAction, Switch } from '@material-ui/core'
import { JSONDisplay } from '../BasePlugin/BasePlugin'

const SettingsModel = Plugin.props({
})

class SettingsController extends shim(SettingsModel, Plugin) {
    get hooks () {
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

const styles = () => createStyles({
    pluginCard: {
        width: '100%',
    },
})

const SettingsView = Component(function SettingsView (props, classes) {
    let plugins = Array.from(props.appState.plugins.entries()).sort(([nameA], [nameB]) => {
        return nameA.localeCompare(nameB)
    })
    let rendered = plugins.map(([name, controller]) => {
        let settings: React.ReactElement<{}>[] = []
        let settingHooks = controller.hooks.Settings
        for (const name in settingHooks) {
            let hook = settingHooks[name]
            settings.push(<ListItem key={name}>
                <ListItemText>
                    {hook.title}
                </ListItemText>
                <ListItemSecondaryAction>
                    <Switch
                        onChange={hook.action}
                        checked={hook.value()}
                    />
                </ListItemSecondaryAction>
            </ListItem>)
        }
        return <ListItem key={name}>
            <Card className={classes.pluginCard}>
                <CardContent>
                    <h3>{name}</h3>
                    {settings.length !== 0 && <List style={{ maxWidth: 300 }}>
                        {settings}
                    </List>}
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
