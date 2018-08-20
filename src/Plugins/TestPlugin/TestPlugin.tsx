import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders } from 'gl-react'
import { types } from 'mobx-state-tree'

const TestModel = Plugin.props({
    extra: 20,
})

class TestController extends shim(TestModel, Plugin) {
    get hooks () {
        return {
            Tabs: {
                Converter: {
                    priority: -3,
                    content: TestView,
                    tab: {
                        label: 'Test',
                    },
                },
            },
        }
    }

    @action
    setExtra (event: any = null) {
        this.extra = 222
    }

    @action
    setExtra2 (event: any = null) {
        this.extra = 237
    }
}

const { Plugin: TestPlugin, Component } = PluginCreator(TestController, TestModel, 'TestPlugin')
export default TestPlugin
export type ITestPlugin = typeof TestPlugin.Type

import { Typography, Theme, createStyles, Card, CardContent } from '@material-ui/core'
import _ from 'lodash'

const styles = (theme: Theme) => createStyles({
    dragger: {
        // margin: `${RenderMargin}px`,
    },
})

const TestView = Component(function TestComponent (props) {
    return <>
        <p>{props.children}</p>
        <p>{this.extra}</p>
        <button onClick={this.setExtra} > Tap me2!</button>
        <button onClick={this.setExtra2} > Tap me!</button>
    </>
}, styles)


const thing = function (times: number, other: (index: number) => boolean) {
    _.times(times, other)
}