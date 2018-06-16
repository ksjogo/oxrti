import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState from '../common/AppState'
import App from '../common/App'

const el = document.createElement('div')
el.id = 'oxrti'
const appState = new AppState()
ReactDOM.render(React.createElement(App, { appState: appState }), el)
document.body.appendChild(el)
