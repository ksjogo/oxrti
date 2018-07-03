import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState from './State/AppState'
import App from './View/App'
import plugins from '../../oxrti.plugins.json'
import * as path from 'path'

export default function init (elementId: string | HTMLElement) {

    let mount = typeof elementId === 'object' ? elementId : document.getElementById(elementId)
    let store = new AppState()

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
    renderApp(App, store)

    // Connect HMR
    if (module.hot) {
        module.hot.accept(['./State/AppState'], () => {
            // Store definition changed, recreate a new one from old state
            store = new (require('./State/AppState').default)(store)
            renderApp(require('./View/App').default, store)
        })

        module.hot.accept(['./View/App'], () => {
            // Componenent definition changed, re-render app
            renderApp(require('./View/App').default, store)
        })

        module.hot.accept((pluginContext as any).id, () => {
            // Some plugin changed, let's reload
            loadPlugins()
        })
    }
}
