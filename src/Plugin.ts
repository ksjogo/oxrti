import { IModelType, types } from 'mobx-state-tree'
import { ModelInterface, shim, action, mst } from 'classy-mst'

const PluginModel = types.model({
    title: types.string,
    loaded: false,
})

class PluginController extends shim(PluginModel) {

    @action
    prepareHooks () {
        console.log('PluginController Hooked')
    }

    @action
    load () {
        this.loaded = true
    }
}

const Plugin = mst(PluginController, PluginModel, 'Plugin')
export default Plugin
export type IPlugin = typeof Plugin.Type
