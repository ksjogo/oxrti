import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'

const ImpExpModel = Plugin.props({
})

class ImpExpController extends shim(ImpExpModel, Plugin) {
    get hooks () {
        return {
            PreDownload: {
                Layers: {
                    func: this.exportState,
                },
            },
            PostLoad: {
                Layers: {
                    func: this.importState,
                },
            },
        }
    }

    @action
    exportState () {
        let btf = this.appState.btf()
        btf.oxrtiState = (this.appState as any).toJSON()
    }

    @action
    importState (loadStateFromFile: boolean) {
        if (!loadStateFromFile)
            return
        let btf = this.appState.btf()
        let state = this.appState.btf().oxrtiState
        this.appState.stateReloader(state)
    }
}

const { Plugin: ImpExpPlugin, Component } = PluginCreator(ImpExpController, ImpExpModel, 'ImpExpPlugin')
export default ImpExpPlugin
export type IImpExpPlugin = typeof ImpExpPlugin.Type
