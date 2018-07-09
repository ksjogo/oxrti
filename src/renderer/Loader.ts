import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { IAppState } from './State/AppState'
import App from './View/App'
import plugins from '../../oxrti.plugins.json'
import * as path from 'path'
import { destroy, getSnapshot } from 'mobx-state-tree'
import { connectReduxDevtools } from 'mst-middlewares'
import * as remotedev from 'remotedev'

let mount: HTMLElement

// webpack bundles the modules into one context
let pluginContext
function reloadPluginContext () {
    // TOIMP: could refine regex here
    pluginContext = require.context('./Plugins', true, /^\.\//)
}

function pluginLoader (name: string, preload = false): Plugin {
    let plugin = pluginContext(`./${name}/${name}`).default as Plugin
    console.log(`${preload ? 'Pre-' : ''}Loaded plugin: ${name}`)
    return plugin
}

// we can load them manually
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

// transform the current state to the new one
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

function renderApp (App, state) {
    ReactDOM.render(React.createElement(App, { appState: state }), mount)
}

function uptimer () {
    state.uptimer()
    setTimeout(uptimer, 1000)
}

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

        module.hot.accept((pluginContext as any).id, (updatedDependencies) => {
            // Some plugin changed, let's reload
            reloadPluginContext()
            loadPlugins()
        })
    }

    uptimer()
}
