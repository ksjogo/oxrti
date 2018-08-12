import { types, IModelType, getSnapshot } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
export type __IModelType = IModelType<any, any>
import Plugin from '../Plugin'
import { reduceRight } from 'lodash'
import HookManager, { HookMapper, HookIterator, AsyncHookIterator } from './HookManager'
import { ConfigHook, FunctionHook, HookConfig, HookName, ComponentHook } from '../Hook'
import Theme from '../View/Theme'
import BTFFile, { BTFCache } from '../BTFFile'
import { TabConfig } from '../View/Tabs'

const AppStateData = types.model({
  activeTab: 0,
  plugins: types.late(() => types.optional(types.map(Plugin), {})),
  hooks: types.optional(types.map(HookManager), {}),
  currentFile: '',
})

export type PluginLoader = (name: string) => Plugin
export type StateReloader = (state: any) => void
let pluginLoader: PluginLoader = null

class AppStateController extends shim(AppStateData) {
  uptime = 0
  loadingTextures = 0
  stateReloader: StateReloader = null

  // volatile cache
  // as we don't want to preserve files inside the state tree
  filecache: BTFCache
  defaultBtf = new BTFFile()

  btf () {

    if (this.currentFile === '')
      return this.filecache[''] || this.defaultBtf

    return this.filecache[this.currentFile]
  }

  @action
  setCurrentFile (name: string) {
    this.currentFile = name
  }

  @action
  loadFile (file: BTFFile, loadStateFromFile = false) {
    this.filecache[file.name] = file
    this.setCurrentFile(file.name)
    this.hookForEach('PostLoad', (hook: FunctionHook) => {
      hook.func(loadStateFromFile)
    })
  }

  theme () {
    return Theme
  }

  setPluginLoader (loader: PluginLoader) {
    pluginLoader = loader
  }

  @action
  setReloader (reloader: StateReloader) {
    this.stateReloader = reloader
  }

  @action
  uptimer () {
    // this.uptime += 1
  }

  @action
  loadPlugin (name: string, hot = false) {
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
    if (hot)
      previous.hotUnload()
    if (previous)
      this.plugins.delete(name)

    this.plugins.set(name, snapshot)

    // hook the plugin into the rest of the program
    let instance = this.plugins.get(name)
    instance.load(this)
    this.loadHooks(name, instance.hooks)
    if (hot)
      instance.hotReload()
  }

  @action
  setActiveTab (index: number) {
    this.activeTab = index
  }

  @action
  async switchTab (event, index) {
    let oldTab = this.hookPick<ConfigHook<TabConfig>>('Tabs', this.activeTab)
    let newTab = this.hookPick<ConfigHook<TabConfig>>('Tabs', index)
    oldTab.beforeFocusLose && await oldTab.beforeFocusLose()
    newTab.beforeFocusGain && await newTab.beforeFocusGain()

    this.setActiveTab(index)

    setTimeout(async () => {
      oldTab.afterFocusLose && await oldTab.afterFocusLose()
      newTab.afterFocusGain && await newTab.afterFocusGain()
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
  hookForEach (name: HookName, iterator?: HookIterator): void {
    let manager = this.hooks.get(name)
    if (!manager)
      return

    if (!iterator)
      iterator = (hook: ComponentHook | FunctionHook | ConfigHook, fullName?: string) => {
        if (hook.func)
          hook.func()
        else
          throw new Error('Can only iterate over function hooks by default!')
      }

    manager.forEach(iterator, name, this)
  }

  async asyncHookForEach (name: HookName, iterator: AsyncHookIterator): Promise<void> {
    let manager = this.hooks.get(name)
    if (!manager)
      return
    await manager.asyncForEach(iterator, name, this)
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
