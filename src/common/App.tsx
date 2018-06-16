import * as React from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import AppState from './AppState'
import { AppContainer } from 'react-hot-loader'

@observer
class App extends React.Component<{ appState: AppState }, {}> {
    render () {
        return (
            <AppContainer>
                <div>
                    {location.hostname === 'localhost' ?
                        <DevTools /> : <div />}
                    <h1>Oxrti</h1>
                    <p>text </p>
                    <p>{this.props.appState.counter}</p>
                </div>
            </AppContainer>
        )
    }
}

export default App
