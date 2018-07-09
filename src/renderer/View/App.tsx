import { AppContainer, hot } from 'react-hot-loader'
import * as React from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { IAppState } from '../State/AppState'
import { ITestPlugin } from '../Plugins/TestPlugin/TestPlugin'

@observer
class App extends React.Component<{ appState: IAppState }, {}> {
    render () {
        let test = (this.props.appState.plugins.get('TestPlugin') as ITestPlugin)
        return (
            <AppContainer>
                <div>
                    {location.hostname === 'localhost' ?
                        <DevTools /> : <div />}
                    <h1>Oxrti</h1>
                    <p>Build 4 </p>
                    <p>{this.props.appState.uptime}</p>
                    <p>{test.extra}</p>
                    <button onClick={test.setExtra} />
                    <button onClick={test.setExtra2} />

                </div>
            </AppContainer>
        )
    }
}
export default hot(module)(App)
