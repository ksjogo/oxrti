import { types, IModelType } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
export type __IModelType = IModelType<any, any>
import Plugin from '../Plugin'

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

  @action
  setPluginLoader (loader: PluginLoader) {
    pluginLoader = loader
  }

  @action
  uptimer () {
    this.uptime += 3
  }

  @action
  otherAction () {

  }

  @action
  loadPlugin (name: string) {
    let plugin = pluginLoader(name)
    debugger
    console.log(plugin)
  }

}

const AppState = mst(AppStateController, AppStateData, 'AppState')
export default AppState

export type IAppState = typeof AppState.Type
