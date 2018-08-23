import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim } from 'classy-mst'
import PTMConverterStrategy from './PTMConverterStrategy'

const PTMConverterModel = Plugin.props({
})

class PTMonverterController extends shim(PTMConverterModel, Plugin) {
    get hooks () {
        return {
            /** %begin */
            ConverterFileFormat: {
                PTM: {
                    fileEndings: ['.ptm'],
                    // refering to the class extending the base strategy
                    strategy: PTMConverterStrategy,
                },
            },
            /** %end */
        }
    }
}

const { Plugin: PTMConverterPlugin, Component } = PluginCreator(PTMonverterController, PTMConverterModel, 'PTMConverterPlugin')
export default PTMConverterPlugin
export type IPTMConverterPlugin = typeof PTMConverterPlugin.Type
