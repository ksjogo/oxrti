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

const TestView = Component(function TestComponent (props) {
    return <>
        <p>{props.children}</p>
        <p>{this.extra}</p>
        <p>{this.shader()}</p>
        <button onClick={this.setExtra} > Tap me2!</button>
        <button onClick={this.setExtra2} > Tap me!</button>
    </>
})
