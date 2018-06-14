import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppState from './AppState'
import App from './App'
import '../style/style.css'

const el = document.createElement('div')
el.id = 'oxrti'
const appState = new AppState()
ReactDOM.render(<App appState={appState} />, el)
document.body.appendChild(el)
console.log('oxrti started')

setTimeout(() => {
}, 10)

setTimeout(() => {
}, 1500)
