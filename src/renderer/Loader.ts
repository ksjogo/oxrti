import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState, { initalState, IAppState } from './State/AppState'
import App from './View/App'
import plugins from '../../oxrti.plugins.json'
import * as path from 'path'
import { destroy, getSnapshot } from 'mobx-state-tree'
import { connectReduxDevtools } from 'mst-middlewares'

export default function init (elementId: string | HTMLElement) {

    let mount = typeof elementId === 'object' ? elementId : document.getElementById(elementId)
    let state: IAppState = null

    function createAppState (snapshot) {

        // kill old store to prevent accidental use and run clean up hooks
        if (state)
            destroy(state)

        // create new one
        state = (require('./State/AppState').default).create(snapshot)

        debugger

        // connect devtools
        // connectReduxDevtools(require('remotedev'), state)

        return state
    }

    function renderApp (App, store) {
        ReactDOM.render(React.createElement(App, { appState: store }), mount)
    }

    let pluginContext = require.context('./Plugins', true, /^\.\//)

    function loadPlugins () {
        console.log(plugins)
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
