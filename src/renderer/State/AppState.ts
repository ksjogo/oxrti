import { types, IModelType, getSnapshot } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
export type __IModelType = IModelType<any, any>
import Plugin from '../Plugin'
import { reduceRight } from 'lodash'

export const initalState = {
  uptime: 2,
  otherValue: 10,
}

const AppStateData = types.model({
  uptime: types.number,
  otherValue: types.number,
  plugins: types.optional(types.map(Plugin), {}),
})

export type PluginLoader = (name: string) => Plugin
let pluginLoader: PluginLoader = null

class AppStateController extends shim(AppStateData) {

  setPluginLoader (loader: PluginLoader) {
    pluginLoader = loader
  }

  @action
  uptimer () {
    this.uptime += 1
  }

  @action
  loadPlugin (name: string) {
    // classy-mst will add the new type to Plugin Union
    let plugin = pluginLoader(name) as Plugin
    // but it will not clear up the previous specifications
    let pluginDeep: any = plugin
    let used: any = {}
    // so we have to clear them up here
    let newTypeList = reduceRight(pluginDeep.$proto.$parent.$typeList, function (flattened, other) {
      let typename = other.name
      if (typename !== '' && used.typename)
        return flattened
      else
        used.typename = true
      flattened.unshift(other)
      return flattened
    }, [])
    // and then overwrite the internal data
    pluginDeep.$proto.$parent.$typeList = newTypeList

    // classy-mst will create the appropiate instance as we fixed the internal types
    let previous = this.plugins.get(name)
    let snapshot = previous ? getSnapshot(previous) : { $: name }

    // force recreation, non-volatile/model state will be preserved
    if (previous)
      this.plugins.delete(name)

    this.plugins.set(name, snapshot)

    // hook the plugin into the rest of the program
    this.plugins.get(name).prepareHooks()

  }

}

const AppState = mst(AppStateController, AppStateData, 'AppState')
export default AppState

export type IAppState = typeof AppState.Type
