import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState from './State/AppState'
import App from './View/App'

export default function init (elementId: string | HTMLElement) {

    let mount = typeof elementId === 'object' ? elementId : document.getElementById(elementId)
    let store = new AppState()

    function renderApp (App, store) {
        ReactDOM.render(React.createElement(App, { appState: store }), mount)
    }

    // Initial render
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
    }
}
