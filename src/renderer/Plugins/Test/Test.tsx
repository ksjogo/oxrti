import React from 'react'
import { mst, shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { IAppState } from '../../State/AppState'
import Plugin from '../../Plugin'

const TodoModel = Plugin.props({
    title: 'Test',
    extra: 20,
})

class TodoController extends shim(TodoModel, Plugin) {
    @action
    setExtra () {
        this.extra = 14
    }
}

const TestPlugin = mst(TodoController, TodoModel, 'TestPlugin')
export default TestPlugin
export type ITestPlugin = typeof TestPlugin.Type

function view (state: IAppState, myState: ITestPlugin) {
    return <p>{myState.title}</p>
}
