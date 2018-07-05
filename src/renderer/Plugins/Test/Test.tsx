import React from 'react'
import { mst, shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { IAppState } from '../../State/AppState'
import Plugin from '../Plugin'

const TodoModel = Plugin.props({
    extra: types.number,
})

class TodoController extends shim(TodoModel, Plugin) {
    @action
    setExtra () {
        this.extra = 10
    }
}

const TestPlugin = mst(TodoController, TodoModel, 'TestPlugin')
export type ITestPlugin = typeof TestPlugin.Type

function view (state: IAppState, myState: ITestPlugin) {
    return <p>{myState.title}</p>
}
