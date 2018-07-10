import React from 'react'
import { mst, shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { IAppState } from '../../State/AppState'
import Plugin from '../../Plugin'
import shader from './shader.glsl'

const TestModel = Plugin.props({
    title: 'Test',
    extra: 20,
})

class TestController extends shim(TestModel, Plugin) {
    @action
    setExtra (event: any = null) {
        this.extra = 18
    }

    @action
    setExtra2 (event: any = null) {
        this.extra = 17
    }

    prepareHooks () {
        super.prepareHooks()
        console.log('TestController hooked')
    }

    shader () {
        return shader
    }
}

const TestPlugin = mst(TestController, TestModel, 'TestPlugin')
export default TestPlugin
export type ITestPlugin = typeof TestPlugin.Type

function view (state: IAppState, myState: ITestPlugin) {
    return <p>{myState.title}</p>
}
