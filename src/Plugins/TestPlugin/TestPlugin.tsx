// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { IAppState } from '../../State/AppState'
// oxrti default imports ->

const TestModel = Plugin.props({
    title: 'Test',
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

const TestView = Component(function TestComponent (props) {
    return <>
        <p>{props.children}</p>
        <p>{this.extra}</p>
        <button onClick={this.setExtra} > Tap me2!</button>
        <button onClick={this.setExtra2} > Tap me!</button>
    </>
})
