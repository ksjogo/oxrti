// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
import PTMConverterStrategy from './PTMConverterStrategy'
// oxrti default imports ->

const PTMConverterModel = Plugin.props({
    title: 'PTM Converter',
})

class PTMonverterController extends shim(PTMConverterModel, Plugin) {
    hooks () {
        return {
            ConverterFileFormat: {
                PTM: {
                    fileEndings: ['.ptm'],
                    strategy: PTMConverterStrategy,
                },
            },
        }
    }
}

const { Plugin: ConverterPlugin, Component } = PluginCreator(PTMonverterController, PTMConverterModel, 'PTMConverterPlugin')
export default ConverterPlugin
