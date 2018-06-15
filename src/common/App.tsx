import * as React from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import AppState from './AppState'
import { hot } from 'react-hot-loader'

@observer
class App extends React.Component<{ appState: AppState }, {}> {
    render () {
        return (
            <div>
                {location.hostname === 'localhost' ?
                    <DevTools /> : <div />}
                <h1>Oxrti</h1>
            </div>
        )
    }
}

export default hot(module)(App)
