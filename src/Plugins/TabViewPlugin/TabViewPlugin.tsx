import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim } from 'classy-mst'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { hot } from 'react-hot-loader'
import { Tooltip } from '../BasePlugin/BasePlugin'
import { AppStyles } from '../BaseThemePlugin/BaseThemePlugin'

const TabViewModel = Plugin.props({
})

class TabViewController extends shim(TabViewModel, Plugin) {
    get hooks () {
        return {
            AppView: {
                TabView: {
                    priority: 100,
                    component: TabView,
                },
            },
        }
    }
}

const { Plugin: TabViewPlugin, Component } = PluginCreator(TabViewController, TabViewModel, 'TabViewPlugin')
export default TabViewPlugin
export type ITabViewPlugin = typeof TabViewPlugin.Type

const TabView = Component(function App (props, classes) {
    let currentTab = this.appState.hookPick('Tabs', this.appState.activeTab)
    let CurrentRender = currentTab.content
    let padding = currentTab.padding !== undefined ? currentTab.padding : 24
    return <div>
        <AppBar position='sticky' className={classes.appBar}>
            <Tabs
                value={this.appState.activeTab}
                onChange={this.appState.switchTab} >
                {this.appState.hookMap('Tabs', (hook, fullName) => {
                    return <Tab {...hook.tab} key={fullName} />
                })}
                <TabActions />
            </Tabs>
        </AppBar>
        <Typography component='div' style={{ padding: padding }}>
            <CurrentRender />
        </Typography>
    </div>
}, AppStyles)


const TabActions = Component(function TabActions (props, classes) {
    return <div className={classes.appBarActions}>
        {this.appState.hookMap('ActionBar', (hook) => {
            let Comp = Component(function TabAction () {
                // TODO: Why is tooltip not shown?
                return <Tab disabled={!hook.enabled()} onClick={hook.onClick} label={<Tooltip title={hook.tooltip}><p>{hook.title}</p></Tooltip>} />
            })
            // TODO: Fix touch ripple
            // return <><TouchRipple {...TouchRippleProps} /><Comp key={hook.title} /></>
            return <Comp key={hook.title} />
        })}
    </div>
}, AppStyles)
