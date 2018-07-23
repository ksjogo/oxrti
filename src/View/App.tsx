import { hot } from 'react-hot-loader'
import * as React from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Component from './Component'
import Theme from './Theme'
import { ConfigHook } from '../Hook'
import { TabConfig } from './Tabs'

function TabContainer (props) {
    return (
        <Typography component='div' style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    )
}
export default hot(module)(Component(function App (props) {
    let currentTab = props.appState.hookPick<ConfigHook<TabConfig>>('Tabs', props.appState.activeTab)
    let CurrentRender = currentTab.content
    return (
        <MuiThemeProvider theme={Theme}>
            <AppBar position='static'>
                <Tabs value={props.appState.activeTab}
                    onChange={props.appState.switchTab} >
                    {props.appState.hookMap('Tabs', (hook: ConfigHook<TabConfig>, fullName) => {
                        return <Tab {...hook.tab} key={fullName} />
                    })}
                </Tabs>
            </AppBar>
            <TabContainer>
                <CurrentRender />
            </TabContainer>
        </MuiThemeProvider>
    )
}))
