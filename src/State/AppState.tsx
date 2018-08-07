import { types, IModelType, getSnapshot } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
export type __IModelType = IModelType<any, any>
import Plugin from '../Plugin'
import { reduceRight } from 'lodash'
import HookManager, { HookMapper, HookIterator } from './HookManager'
import { ConfigHook, HookConfig, HookName } from '../Hook'
import Theme from '../View/Theme'
import BTFFile, { BTFCache } from '../BTFFile'
import { TabConfig } from '../View/Tabs'

const AppStateData = types.model({
  uptime: 0,
  activeTab: 0,
  plugins: types.late(() => types.optional(types.map(Plugin), {})),
  hooks: types.optional(types.map(HookManager), {}),
  currentFile: '',
  loadingTextures: 0,
})

export type PluginLoader = (name: string) => Plugin
let pluginLoader: PluginLoader = null

class AppStateController extends shim(AppStateData) {

  // volatile cache
  // as we don't want to preserve files inside the state tree
  filecache: BTFCache

  btf () {
    if (this.currentFile === '')
      return null
    return this.filecache[this.currentFile]
  }

  @action
  loadFile (file: BTFFile) {
    this.filecache[file.name] = file
    this.currentFile = file.name
  }

  theme () {
    return Theme
  }

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
    let plugin = pluginLoader(name)
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
    let instance = this.plugins.get(name)
    instance.load(this)
    this.loadHooks(name, instance.hooks())
  }

  @action switchTab (event, index) {
    let oldTab = this.hookPick<ConfigHook<TabConfig>>('Tabs', this.activeTab)
    let newTab = this.hookPick<ConfigHook<TabConfig>>('Tabs', index)
    oldTab.beforeFocusLose && oldTab.beforeFocusLose()
    newTab.beforeFocusGain && newTab.beforeFocusGain()

    this.activeTab = index

    setTimeout(() => {
      oldTab.afterFocusLose && oldTab.afterFocusLose()
      newTab.afterFocusGain && newTab.afterFocusGain()
    }, 10)
  }

  /**
   * Connect all hooks in our state tree
   * @param pluginName need to store the reference
   * @param hooks actual hook configuration
   */
  @action
  loadHooks (pluginName: string, hooks: HookConfig) {
    for (let hookName in hooks) {
      // ensure we got an appropiate hook manager
      let manager = this.hooks.get(hookName)
      if (!manager) {
        this.hooks.set(hookName, HookManager.create({}))
        manager = this.hooks.get(hookName)
      }
      for (let functionName in hooks[hookName]) {
        // create a unique reference
        let hookReference = `${pluginName}$${hookName}$${functionName}`
        let priority = hooks[hookName][functionName].priority
        // and actually insert it
        manager.insert(hookReference, priority)
      }
    }
  }

  @action
  textureIsLoading () {
    this.loadingTextures++
  }

  @action
  textureLoaded () {
    this.loadingTextures--
  }

  /**
   * Iterate over a given hookname
   * @param name of the hook
   * @param iterator function, will be called with each concrete hook instance, could be multiple from one plugin
   */
  hookForEach (name: HookName, iterator: HookIterator): void {
    let manager = this.hooks.get(name)
    if (!manager)
      return
    manager.forEach(iterator, name, this)
  }

  /**
   * Iterate over a given hookname in reverse order
   * @param name of the hook
   * @param iterator function, will be called with each concrete hook instance, could be multiple from one plugin
   */
  hookForEachReverse (name: HookName, iterator: HookIterator): void {
    let manager = this.hooks.get(name)
    if (!manager)
      return
    manager.forEachReverse(iterator, name, this)
  }

  /**
   * Map over a given hookname
   * @param name of the hook
   * @param mapper function, will be called with each concrete hook instance, could be multiple from one plugin
   */
  hookMap<S> (name: HookName, mapper: HookMapper<S>): S[] {
    let manager = this.hooks.get(name)
    if (!manager)
      return []
    return manager.map(mapper, name, this)
  }

  hookPick<S> (name: HookName, index: number): S {
    let manager = this.hooks.get(name)
    if (!manager)
      return null
    return manager.pick(index, name, this)
  }

  // hookFind<S> (name: HookName, filter: number): S {
}

const AppState = mst(AppStateController, AppStateData, 'AppState')
export default AppState

export type IAppState = typeof AppState.Type
