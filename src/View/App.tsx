import { hot } from 'react-hot-loader'
import * as React from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Component from './Component'
import Theme from './Theme'
import Viewer from './Viewer'
import Settings from './Settings'
import Converter from './Converter'

function TabContainer (props) {
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
                    <Viewer />
                </TabContainer>}
            {props.appState.activeTab === 1 &&
                <TabContainer>
                    <Converter />
                </TabContainer>}
            {props.appState.activeTab === 2 &&
                <TabContainer>
                    <Settings />
                </TabContainer>}
        </MuiThemeProvider>
    )
}))