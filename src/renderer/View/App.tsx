import * as React from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import AppState from '../State/AppState'
import { AppContainer, hot } from 'react-hot-loader'
import { DefaultScene } from './DefaultScene'
import Test from '../Plugins/Test/Test'

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
                    <p>{this.props.appState.uptime}</p>
                    <DefaultScene />
                </div>
            </AppContainer>
        )
    }
}
export default hot(module)(App)
