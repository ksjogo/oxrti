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
    surfaceContainer: {
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

import Plugin, { PluginCreator } from '../../Plugin'
import { shim } from 'classy-mst'
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import _ from 'lodash'
import { createMuiTheme } from '@material-ui/core/styles'

const BaseThemeModel = Plugin.props({
})

export class BaseThemeController extends shim(BaseThemeModel, Plugin) {
    /** %begin */
    /** app wide theme definitions */
    themeBase: ThemeOptions = {
        palette: {
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

    /** per theme plugin overridable definitions */
    themeExtension: ThemeOptions = {}
    /** %end */

    get theme () {
        return createMuiTheme(_.merge(this.themeBase, this.themeExtension))
    }
}

const { Plugin: BaseThemePlugin } = PluginCreator(BaseThemeController, BaseThemeModel, 'BaseThemePlugin')
export default BaseThemePlugin
export type IBaseThemePlugin = typeof BaseThemePlugin.Type
