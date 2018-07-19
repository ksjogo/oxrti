// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->

const ConverterModel = Plugin.props({
    title: 'Converter',
})

class ConverterController extends shim(ConverterModel, Plugin) {
    hooks () {
        return {
            Tabs: {
                Converter: {
                    priority: 10,
                    config: {
                        content: ConverterView,
                        tab: {
                            label: 'Converter',
                        },
                    },
                },
            },
        }
    }
}

const { Plugin: ConverterPlugin, Component } = PluginCreator(ConverterController, ConverterModel, 'ConverterPlugin')
export default ConverterPlugin

const ConverterView = Component(function ConverterView (props) {
    return <h1>Converter</h1>
})
