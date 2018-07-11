import { hot } from 'react-hot-loader'
import * as React from 'react'
import { observer, Provider, inject } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { IAppState } from '../State/AppState'
import { ITestPlugin } from '../Plugins/TestPlugin/TestPlugin'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import red from '@material-ui/core/colors/red'
import GLView from './GLView'
import shader2 from './test.glsl'
import shader from '../Plugins/TestPlugin/shader.glsl'

// TOFIX: not working standalone currently
// import 'typeface-roboto'

// let's be a bit special and use our own theme
const theme = createMuiTheme({
    palette: {
        primary: red,
    },
})

function TabContainer (props) {
    return (
        <Typography component='div' style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    )
}

@inject('appState')
@observer
class App extends React.Component<{ appState: IAppState }, {}> {

    render () {
        let test = (this.props.appState.plugins.get('TestPlugin') as ITestPlugin)
        return (
            <MuiThemeProvider theme={theme}>
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
                        <p>{test.shader()}</p>
                        <button onClick={test.setExtra} > Tap me!</button>
                        <button onClick={test.setExtra2} > Tap me!</button>
                    </TabContainer>}
                {this.props.appState.activeTab === 1 &&
                    <TabContainer>
                        <GLView shader={shader} uniforms={{ iGlobalTime: this.props.appState.uptime }} />
                        <GLView shader={shader2} uniforms={{ blue: 0 }} />
                        Item Two
                        </TabContainer>}
                {this.props.appState.activeTab === 2 &&
                    <TabContainer>
                        Item Three
                        </TabContainer>}
            </MuiThemeProvider>
        )
    }
}
export default hot(module)(App)
