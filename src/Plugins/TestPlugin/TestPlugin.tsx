// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { IAppState } from '../../State/AppState'
// oxrti default imports ->

import shader from './shader.glsl'

const TestModel = Plugin.props({
    title: 'Test',
    extra: 20,
})

class TestController extends shim(TestModel, Plugin) {
    @action
    setExtra (event: any = null) {
        this.extra = 222
    }

    @action
    setExtra2 (event: any = null) {
        this.extra = 237
    }

    prepareHooks (appState: IAppState) {
        super.prepareHooks(appState)
        console.log('TestController hooked')
    }

    shader () {
        return shader
    }

    components () {
        return {
            'Test': TestView,
        }
    }
}

const { Plugin: TestPlugin, Component } = PluginCreator(TestController, TestModel, 'TestPlugin')
export default TestPlugin

const TestView = Component((plugin, props) => {
    return <>
        <p>{props.children}</p>
        <p>{plugin.extra}</p>
        <p>{plugin.shader()}</p>
        <button onClick={plugin.setExtra} > Tap me2!</button>
        <button onClick={plugin.setExtra2} > Tap me!</button>
    </>
})
