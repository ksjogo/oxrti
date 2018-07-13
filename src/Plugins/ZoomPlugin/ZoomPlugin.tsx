import React from 'react'
import Plugin, { PluginCreator, shim, action } from '../../Plugin'
import shader from './zoom.glsl'

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
        this.extra = 234
    }

    prepareHooks () {
        super.prepareHooks()
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
