import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import BaseTheme, { IBaseThemePlugin } from '../BaseThemePlugin/BaseThemePlugin'
import { shim, action } from 'classy-mst'
import red from '@material-ui/core/colors/red'
import { HookConfig } from '../../Hook'
import { StyleRules, Theme } from '@material-ui/core/styles'

const RedThemeModel = BaseTheme.props({
})

class RedThemeController extends shim(RedThemeModel, BaseTheme) {

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

    themeExtension = {
        palette: {
            primary: red,
        },
    }

    classesExtension (theme: Theme): StyleRules {
        return {
        }
    }
}

const { Plugin: RedThemePlugin, Component } = PluginCreator(RedThemeController, RedThemeModel, 'RedThemePlugin')
export default RedThemePlugin
export type IRedThemePlugin = typeof RedThemePlugin.Type
