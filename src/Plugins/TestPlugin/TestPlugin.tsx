import React from 'react'
import { mst, shim, action } from 'classy-mst'
import Plugin from '../../Plugin'
import shader from './shader.glsl'
import Component from '../../View/Component'

const TestModel = Plugin.props({
    title: 'Test',
    extra: 20,
})

class TestController extends shim(TestModel, Plugin) {
    @action
    setExtra (event: any = null) {
        this.extra = 20
    }

    @action
    setExtra2 (event: any = null) {
        this.extra = 21
    }

    prepareHooks () {
        super.prepareHooks()
        console.log('TestController hooked')
    }

    shader () {
        return shader
    }
}

const TestView = Component<{ thing: string }>(props => {
    let test = (props.appState.plugins.get('TestPlugin') as ITestPlugin)
    return <>
        <p>{test.extra}</p>
        <p>{test.shader()}</p>
        <button onClick={test.setExtra} > Tap me2!</button>
        <button onClick={test.setExtra2} > Tap me!</button>
        <p>{props.thing}</p>
    </>
})

const TestPlugin = mst(TestController, TestModel, 'TestPlugin')
type ITestPlugin = typeof TestPlugin.Type

export default TestPlugin
export {
    TestView,
    ITestPlugin,
}
