// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
// oxrti default imports ->
import PTMLRGB from './PTMLRGB'
import { ChannelModel } from '../../BTFFile'

const PTMRendererModel = Plugin.props({
    title: 'PTMRenderer',
})

class PTMRendererController extends shim(PTMRendererModel, Plugin) {
    hooks () {
        return {
            RendererForModel: {
                LRGB: {
                    channelModel: 'LRGB' as ChannelModel,
                    node: new PTMLRGB(),
                },
            },
        }
    }
}

const { Plugin: PTMRendererPlugin, Component } = PluginCreator(PTMRendererController, PTMRendererModel, 'PTMRendererPlugin')
export default PTMRendererPlugin
export type IPTMRendererPlugin = typeof PTMRendererPlugin.Type
