import { AppContainer, hot } from 'react-hot-loader'
import * as React from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { DefaultScene } from './DefaultScene'
import { IAppState } from '../State/AppState'

@observer
class App extends React.Component<{ appState: IAppState }, {}> {
    render () {
        return (
            <AppContainer>
                <div>
                    {location.hostname === 'localhost' ?
                        <DevTools /> : <div />}
                    <h1>Oxrti</h1>
                    <p>Build 4 </p>
                    <p>{this.props.appState.uptime}</p>
                    <DefaultScene />
                </div>
            </AppContainer>
        )
    }
}
export default hot(module)(App)
