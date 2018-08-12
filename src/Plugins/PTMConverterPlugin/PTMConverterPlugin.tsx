// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
import PTMConverterStrategy from './PTMConverterStrategy'
// oxrti default imports ->

const PTMConverterModel = Plugin.props({
})

class PTMonverterController extends shim(PTMConverterModel, Plugin) {
    get hooks () {
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

const { Plugin: PTMConverterPlugin, Component } = PluginCreator(PTMonverterController, PTMConverterModel, 'PTMConverterPlugin')
export default PTMConverterPlugin
export type IPTMConverterPlugin = typeof PTMConverterPlugin.Type
