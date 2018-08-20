import { createStyles, Theme } from '@material-ui/core'

// TOFIX: not working standalone currently
// import 'typeface-roboto'
import './style.css'

const DrawerWidth = 350
const AppStyles = (theme: Theme) => createStyles({
    container: {
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    appBarActions: {
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.primary.main,
        borderLeft: '2px solid rgba(255, 255, 255, 0.12)',
    },
    toolbar: theme.mixins.toolbar,
    stack: {
    },
    drawer: {
        position: 'relative',
        width: `${DrawerWidth}px`,
    },
    drawerPaper: {
        position: 'relative',
        width: `${DrawerWidth}px`,
        flex: '1 0 auto',
        height: '100vh',
        display: 'flex',
        overflowY: 'auto',
        flexDirection: 'column',
    },
    content: {
        width: '100vw',
        height: '100vh',
        'max-height': 'calc(100vh - 48px)',
        'max-width': `calc(100vw - ${DrawerWidth}px)`,
    },
})

export { DrawerWidth, AppStyles }

import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import _ from 'lodash'
import { createMuiTheme, StyleRules } from '@material-ui/core/styles'

const BaseThemeModel = Plugin.props({
})

class BaseThemeController extends shim(BaseThemeModel, Plugin) {

    themeBase: ThemeOptions = {
        palette: {
            // primary: red,
        },
        overrides: {
            MuiTooltip: {
                tooltip: {
                    fontSize: 16,
                },
                tooltipPlacementBottom: {
                    marginTop: 5,
                },
                tooltipPlacementTop: {
                    marginBottom: 5,
                },
            },
        },
    }

    themeExtension: ThemeOptions = {}

    get theme () {
        return createMuiTheme(_.merge(this.themeBase, this.themeExtension))
    }
}

const { Plugin: BaseThemePlugin, Component } = PluginCreator(BaseThemeController, BaseThemeModel, 'RedThemePlugin')
export default BaseThemePlugin
export type IBaseThemePlugin = typeof BaseThemePlugin.Type
