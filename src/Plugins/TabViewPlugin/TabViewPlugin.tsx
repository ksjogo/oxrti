import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { hot } from 'react-hot-loader'
import { Tooltip } from '../BasePlugin/BasePlugin'
import { AppStyles } from '../BaseThemePlugin/BaseThemePlugin'

const TabViewModel = Plugin.props({
    activeTab: 0,
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

    @action
    setActiveTab (index: number) {
        this.activeTab = index
    }

    @action
    async switchTab (event: any, index: number) {
        let oldTab = this.appState.hookPick('Tabs', this.activeTab)
        let newTab = this.appState.hookPick('Tabs', index)
        oldTab.beforeFocusLose && await oldTab.beforeFocusLose()
        newTab.beforeFocusGain && await newTab.beforeFocusGain()

        this.setActiveTab(index)

        setTimeout(async () => {
            oldTab.afterFocusLose && await oldTab.afterFocusLose()
            newTab.afterFocusGain && await newTab.afterFocusGain()
        }, 10)
    }

}

const { Plugin: TabViewPlugin, Component } = PluginCreator(TabViewController, TabViewModel, 'TabViewPlugin')
export default TabViewPlugin
export type ITabViewPlugin = typeof TabViewPlugin.Type

const TabView = Component(function App (props, classes) {
    let currentTab = this.appState.hookPick('Tabs', this.activeTab)
    let CurrentRender = currentTab.content
    let padding = currentTab.padding !== undefined ? currentTab.padding : 24
    return <div>
        <AppBar position='sticky' className={classes.appBar}>
            <Tabs
                value={this.activeTab}
                onChange={this.switchTab} >
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
