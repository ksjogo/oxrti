import { IModelType, types } from 'mobx-state-tree'
import { ModelInterface, shim, action, mst } from 'classy-mst'

const PluginModel = types.model({
    title: types.string,
    loaded: false,
})

type hooks = []

class PluginController extends shim(PluginModel) {

    @action
    prepareHooks (hooks: hooks) {
        console.log('hooked')
    }

    @action
    load () {
        this.loaded = true
    }
}

const Plugin = mst(PluginController, PluginModel, 'TestPlugin')
export default Plugin
export type IPlugin = typeof Plugin.Type
