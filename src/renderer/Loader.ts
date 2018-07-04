import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState, { initalState, IAppState } from './State/AppState'
import App from './View/App'
import plugins from '../../oxrti.plugins.json'
import * as path from 'path'
import { destroy, getSnapshot } from 'mobx-state-tree'
import { connectReduxDevtools, asReduxStore } from 'mst-middlewares'
import * as remotedev from 'remotedev'

export default function init (elementId: string | HTMLElement) {

    let mount = typeof elementId === 'object' ? elementId : document.getElementById(elementId)
    let state: IAppState = null

    // transform the current state to the new one
    function createAppState (snapshot) {
        // kill old store to prevent accidental use and run clean up hooks
        try {
            if (state) {
                if ((window as any).devToolsExtension)
                    (window as any).devToolsExtension.disconnect()
                destroy(state)
            }
        } catch (e) {
            // there is some circular kill detection in mobx
            // we can ignore that as we kill the state anyway
        }

        // create new one
        state = (require('./State/AppState').default).create(snapshot)
        connectReduxDevtools(remotedev, state)

        return state
    }

    function renderApp (App, state) {
        ReactDOM.render(React.createElement(App, { appState: state }), mount)
    }

    // webpack bundles the modules into one context
    let pluginContext = require.context('./Plugins', true, /^\.\//)

    // we can load them manually
    function loadPlugins () {
        plugins.forEach(name => {
            if (name !== path.basename(name)) {
                console.error('file-system paths currently not allowed for plugins')
            } else {
                let plugin = pluginContext(`./${name}/${name}`).default as Plugin
                console.log(`Loaded plugin: ${plugin.name}`)
            }
        })
    }

    // Initial run
    loadPlugins()
    renderApp(App, createAppState(initalState))

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

        module.hot.accept((pluginContext as any).id, () => {
            // Some plugin changed, let's reload
            loadPlugins()
        })
    }

    function uptimer () {
        state.uptimer()
        setTimeout(uptimer, 1000)
    }
    uptimer()
}
