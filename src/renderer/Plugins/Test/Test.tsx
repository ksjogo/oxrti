import { types } from 'mobx-state-tree'
import { mst, shim, action } from 'classy-mst'
import { Component } from 'react'
import Plugin from '../Plugin'

const TodoModel = types.model({

    title: types.string,
    done: false,

})

class TodoController extends shim(TodoModel) {

    @action
    toggle () {
        this.done = !this.done
    }

}

class TodoView extends Component {
    setState (state) { }
}

let instance = new Plugin('Todo', TodoModel, TodoController, TodoView)
export default instance
