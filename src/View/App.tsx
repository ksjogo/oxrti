import { hot } from 'react-hot-loader'
import * as React from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Component from './Component'
import { default as DefaultTheme } from './Theme'
import { ConfigHook } from '../Hook'
import { TabConfig } from './Tabs'
import AppStyles from './AppStyles'

export default hot(module)(Component(function App (props, classes) {
    let currentTab = props.appState.hookPick('Tabs', props.appState.activeTab)
    let CurrentRender = currentTab.content
    let padding = currentTab.padding !== undefined ? currentTab.padding : 24
    return (
        <MuiThemeProvider theme={DefaultTheme}>
            <AppBar position='sticky' className={classes.appBar}>
                <Tabs
                    value={props.appState.activeTab}
                    onChange={props.appState.switchTab} >
                    {props.appState.hookMap('Tabs', (hook, fullName) => {
                        return <Tab {...hook.tab} key={fullName} />
                    })}
                </Tabs>
            </AppBar>
            <Typography component='div' style={{ padding: padding }}>
                <CurrentRender />
            </Typography>
        </MuiThemeProvider>
    )
}, AppStyles))
