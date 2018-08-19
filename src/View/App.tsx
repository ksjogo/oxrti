import { hot } from 'react-hot-loader'
import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import AppStyles from './AppStyles'
import { IAppState } from '../State/AppState'
import { observer, inject } from 'mobx-react'
import { withStyles, Button, Toolbar } from '@material-ui/core'

function App (props: any) {
    let appState = props.appState as IAppState
    let currentTab = appState.hookPick('Tabs', appState.activeTab)
    let CurrentRender = currentTab.content
    let padding = currentTab.padding !== undefined ? currentTab.padding : 24
    return <div>
        <AppBar position='sticky' className={props.classes.appBar}>
            <Tabs
                value={appState.activeTab}
                onChange={appState.switchTab} >
                {appState.hookMap('Tabs', (hook, fullName) => {
                    return <Tab {...hook.tab} key={fullName} />
                })}
                <div className={props.classes.appBarActions}>
                    <Tab onClick={() => console.log('clicked')} label='buttoN'>test</Tab>
                </div>
            </Tabs>
        </AppBar>
        <Typography component='div' style={{ padding: padding }}>
            <CurrentRender />
        </Typography>
    </div>
}

const MobX = inject('appState')(observer(App))
const Styled = withStyles(AppStyles)(MobX)

export default hot(module)(Styled) as React.StatelessComponent
