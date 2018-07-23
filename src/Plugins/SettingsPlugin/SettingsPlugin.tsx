// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
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

const SettingsView = Component(function SettingsView (props) {
    return <h1>Settings</h1>
})
