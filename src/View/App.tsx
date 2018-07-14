import { hot } from 'react-hot-loader'
import * as React from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import GLView from './GLView'
import shader2 from './test.glsl'
import shader from '../Plugins/TestPlugin/shader.glsl'
import Component from './Component'
import Theme from './Theme'
import PluginRender from './PluginRender'
import Stack from './Stack'

function TabContainer(props) {
    return (
        <Typography component='div' style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    )
}
export default hot(module)(Component(props => {
    return (
        <MuiThemeProvider theme={Theme}>
            <AppBar position='static'>
                <Tabs value={props.appState.activeTab}
                    onChange={props.appState.switchTab} >
                    <Tab label='Main' />
                    <Tab label='Converter' />
                    <Tab label='Settings' />
                </Tabs>
            </AppBar>
            {props.appState.activeTab === 0 &&
                <TabContainer>
                    <p >Welcome home</p>
                    <h1>Oxrti</h1>
                    <p>Build 4 </p>
                    <p>{props.appState.uptime}</p>
                    <PluginRender name='TestPlugin:Test' />
                </TabContainer>}
            {props.appState.activeTab === 1 &&
                <TabContainer>
                    <GLView shader={shader} uniforms={{ iGlobalTime: props.appState.uptime }} />
                    <GLView shader={shader2} uniforms={{ blue: 1 }} />
                    <Stack />
                    Item Two
                        </TabContainer>}
            {props.appState.activeTab === 2 &&
                <TabContainer>
                    Item Three
                        </TabContainer>}
        </MuiThemeProvider>
    )
}))
