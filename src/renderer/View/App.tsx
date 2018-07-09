import { AppContainer, hot } from 'react-hot-loader'
import * as React from 'react'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { IAppState } from '../State/AppState'
import { ITestPlugin } from '../Plugins/TestPlugin/TestPlugin'
import autobind from 'autobind-decorator'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'

function TabContainer (props) {
    return (
        <Typography component='div' style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    )
}

@observer
class App extends React.Component<{ appState: IAppState }, {}> {

    render () {
        let test = (this.props.appState.plugins.get('TestPlugin') as ITestPlugin)
        return (
            <div>
                {location.hostname === 'localhost' ?
                    <DevTools /> : <div />}
                <AppBar position='static'>
                    <Tabs value={this.props.appState.activeTab}
                        onChange={this.props.appState.switchTab} >
                        <Tab label='Main' />
                        <Tab label='Converter' />
                        <Tab label='Settings' />
                    </Tabs>
                </AppBar>
                {this.props.appState.activeTab === 0 &&
                    <TabContainer>
                        <p >Welcome home</p>
                        <h1>Oxrti</h1>
                        <p>Build 4 </p>
                        <p>{this.props.appState.uptime}</p>
                        <p>{test.extra}</p>
                        <button onClick={test.setExtra} > Tap me!</button>
                        <button onClick={test.setExtra2} > Tap me!</button>
                    </TabContainer>}
                {this.props.appState.activeTab === 1 &&
                    <TabContainer>
                        Item Two
                        </TabContainer>}
                {this.props.appState.activeTab === 2 &&
                    <TabContainer>
                        Item Three
                        </TabContainer>}
            </div>
        )
    }
}
export default hot(module)(App)
