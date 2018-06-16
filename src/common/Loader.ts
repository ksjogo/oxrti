import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState from './AppState'
import App from './App'

let mount = document.getElementById('app')
let store = new AppState()

function renderApp (App, store) {
    ReactDOM.render(React.createElement(App, { appState: store }), mount)
}

// Initial render
renderApp(App, store)

// Connect HMR
if (module.hot) {
    module.hot.accept(['./AppState'], () => {
        // Store definition changed, recreate a new one from old state
        store = new (require('./AppState').default)(store)
        renderApp(require('./App').default, store)
    })

    module.hot.accept(['./App'], () => {
        // Componenent definition changed, re-render app
        renderApp(require('./App').default, store)
    })
}
