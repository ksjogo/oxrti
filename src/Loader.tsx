import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { IAppState } from './State/AppState'
import App from './View/App'
import plugins from '../oxrti.plugins.json'
import * as path from 'path'
import { destroy, getSnapshot } from 'mobx-state-tree'
import { connectReduxDevtools } from 'mst-middlewares'
import * as remotedev from 'remotedev'
import { Provider } from 'mobx-react'
import { BTFCache } from './BTFFile'
import makeInspectable from 'mobx-devtools-mst'

if (plugins.indexOf('BasePlugin') === -1) {
    alert('BasePlugin needs to be loaded always!')
}

let mount: HTMLElement

// webpack bundles the modules into one context
let pluginContext: any
let pluginModules: { [key: string]: any } = {}
function reloadPluginContext (inital = false) {
    pluginContext = require.context('./Plugins', true, /^\.\//)
    return pluginContext
}

/**
 * Load the plugin's code via webpack context
 * @param name must be the same as folder and filename
 * @param preload must be enabled on first run to allow the classy-mst type registration before instanziation
 */
function pluginLoader (name: string, preload = false): Plugin {
    let plugin = pluginContext(`./${name}/${name}`).default as Plugin
    console.log(`${preload ? 'Pre-' : ''}Loaded plugin: ${name}`)
    return plugin
}

/**
 * Load all plugins
 * @param preload as above
 */
function loadPlugins (preload = false) {
    plugins.forEach(name => {
        if (name !== path.basename(name)) {
            console.error('file-system paths currently not allowed for plugins')
        } else {
            // types need to be know to be able to reconstruct from state tree
            if (preload)
                pluginLoader(name, preload)
            else
                state.loadPlugin(name)
        }
    })
}

let state: IAppState = null
let filecache: BTFCache = {}
/**
 * transform the current state to the new one
 * @param snapshot the previous tree snapshot
 */
function createAppState (snapshot = {}) {
    // kill old store to prevent accidental use and run clean up hooks
    try {
        if (state) {
            if ((window as any).devToolsExtension)
                (window as any).devToolsExtension.disconnect()
            // destroy(state)
        }
    } catch (e) {
        // there is some circular kill detection in mobx due to the redux devtools
        // we can ignore that as we kill the state anyway
    }

    // create new one
    state = (require('./State/AppState').default).create(snapshot)
    state.filecache = filecache

    makeInspectable(state)

    if ((window as any).devToolsExtension)
        connectReduxDevtools(remotedev, state)

    state.setPluginLoader(pluginLoader)
    state.setReloader(setStateFromSnapshot)

    return state
}

/**
 * Render reactly on the detected mount point
 * @param App app (view) code
 * @param state state tree
 */
function renderApp (App: React.StatelessComponent, state: IAppState) {
    let Async = (React as any).unstable_AsyncMode
    ReactDOM.render(<Provider appState={state} >
        {/* <Async>
            <App />
        </Async> */}
        <App />
    </Provider>, mount)
}

/**
 * Standard function to have some global timerac
 * Currently spamming the redux dev tools though
 */
function uptimer () {
    state.uptimer()
    setTimeout(uptimer, 1000)
}

/**
 * Set state from a btf file
 */
function setStateFromSnapshot (snapshot: any) {
    for (let key in snapshot) {
        (state as any)[key] = snapshot[key]
    }
}

/**
 * Let's get this started
 * @param elementId Hook into elementId or HTMLElement
 */
export default function init (elementId: string | HTMLElement) {

    mount = typeof elementId === 'object' ? elementId : document.getElementById(elementId)

    // Initial run
    reloadPluginContext(true)
    loadPlugins(true)
    createAppState()
    loadPlugins()
    renderApp(App, state)

    // Connect HMR
    if (module.hot) {
        module.hot.accept(['./State/AppState'], () => {
            // Store definition changed, recreate a new one from old state
            // renderApp(require('./View/App').default, createAppState(getSnapshot(state)))
            // loadPlugins()
            console.error('cannot hot-reload appstate, please do a full reload')
        })

        module.hot.accept(['./View/App'], () => {
            // Componenent definition changed, re-render app
            renderApp(require('./View/App').default, state)
            console.log('updated main view')
        })

        module.hot.accept(pluginContext.id, () => {
            let reloadedContext = reloadPluginContext()
            // we need to find the changed modules
            // code akin to https://github.com/webpack/docs/wiki/hot-module-replacement
            let changedModules = reloadedContext.keys()
                .map(function (key: string) {
                    return [key, reloadedContext(key)]
                })
                .filter(function (reloadedModule: any) {
                    return pluginModules[reloadedModule[0]] !== reloadedModule[1]
                })
            changedModules.forEach(function (module: any) {
                (pluginModules as any)[module[0]] = module[1]
                // filter for real plugin roots
                let moduleName: string = module[0]
                if (!moduleName.endsWith('Plugin.tsx'))
                    return
                // should regex?
                moduleName = moduleName.split('/').reverse()[0].split('.')[0]
                // and reload them
                state.loadPlugin(moduleName, true)
            })
        })
        // store inital modules to compare for changes later
        pluginContext.keys().forEach(function (key: string) {
            let module = pluginContext(key)
            pluginModules[key] = module
        })

    }

    // uptimer()
}
