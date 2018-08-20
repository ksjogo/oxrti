import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import BaseTheme, { IBaseThemePlugin } from '../BaseThemePlugin/BaseThemePlugin'
import { shim, action } from 'classy-mst'
import { blue } from '@material-ui/core/colors/'
import { HookConfig } from '../../Hook'

const BlueThemeModel = BaseTheme.props({
})

class BlueThemeController extends shim(BlueThemeModel, BaseTheme) {

    get hooks (): HookConfig {
        return {
            Theme: {
                Blue: {
                    priority: 100,
                    controller: this,
                },
            },
        }
    }

    themeExtension = {
        palette: {
            primary: blue,
        },
    }
}

const { Plugin: BlueThemePlugin, Component } = PluginCreator(BlueThemeController, BlueThemeModel, 'BlueThemePlugin')
export default BlueThemePlugin
export type IBlueThemePlugin = typeof BlueThemePlugin.Type
