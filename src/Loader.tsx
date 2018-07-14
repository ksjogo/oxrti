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

let mount: HTMLElement

// webpack bundles the modules into one context
let pluginContext
function reloadPluginContext () {
    // TOIMP: could refine regex here
    pluginContext = require.context('./Plugins', true, /^\.\//)
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
            destroy(state)
        }
    } catch (e) {
        // there is some circular kill detection in mobx due to the redux devtools
        // we can ignore that as we kill the state anyway
    }

    // create new one
    state = (require('./State/AppState').default).create(snapshot)

    if ((window as any).devToolsExtension)
        connectReduxDevtools(remotedev, state)

    state.setPluginLoader(pluginLoader)

    return state
}

/**
 * Render reactly on the detected mount point
 * @param App app (view) code
 * @param state state tree
 */
function renderApp (App, state) {
    ReactDOM.render(<Provider appState={state} >
        <App />
    </Provider>, mount)
}

/**
 * Standard function to have some global timer
 * Currently spamming the redux dev tools though
 */
function uptimer () {
    state.uptimer()
    setTimeout(uptimer, 1000)
}

/**
 * Let's get this started
 * @param elementId Hook into elementId or HTMLElement
 */

export default function init (elementId: string | HTMLElement) {

    mount = typeof elementId === 'object' ? elementId : document.getElementById(elementId)

    // Initial run
    reloadPluginContext()
    loadPlugins(true)
    createAppState()
    loadPlugins()
    renderApp(App, state)

    // Connect HMR
    if (module.hot) {
        module.hot.accept(['./State/AppState'], () => {
            // Store definition changed, recreate a new one from old state
            renderApp(require('./View/App').default, createAppState(getSnapshot(state)))
        })

        module.hot.accept(['./View/App'], () => {
            // Componenent definition changed, re-render app
            renderApp(require('./View/App').default, state)
        })

        module.hot.accept((pluginContext).id, (updatedDependencies) => {
            // Some plugin changed, let's reload
            reloadPluginContext()
            loadPlugins()
        })
    }

    uptimer()
}
