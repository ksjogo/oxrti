import { PluginCreator } from '../../Plugin'
import BaseTheme from '../BaseThemePlugin/BaseThemePlugin'
import { shim } from 'classy-mst'
import red from '@material-ui/core/colors/red'
import { HookConfig } from '../../Hook'
import { StyleRules } from '@material-ui/core/styles'

const RedThemeModel = BaseTheme.props({
})

class RedThemeController extends shim(RedThemeModel, BaseTheme) {

    /** %begin */
    get hooks (): HookConfig {
        return {
            Theme: {
                Red: {
                    priority: 100,
                    controller: this,
                },
            },
        }
    }
    /** %end */

    themeExtension = {
        palette: {
            primary: red,
        },
    }

    classesExtension (): StyleRules {
        return {
        }
    }
}

const { Plugin: RedThemePlugin } = PluginCreator(RedThemeController, RedThemeModel, 'RedThemePlugin')
export default RedThemePlugin
export type IRedThemePlugin = typeof RedThemePlugin.Type
