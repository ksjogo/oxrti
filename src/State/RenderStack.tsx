import { types } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import Plugin from '../Plugin'

/**
 * Single entry
 */
const RenderStackEntry = types.model({
    name: types.string,
    priority: types.number,
})

/**
 * Keeping track of all entries
 */
const RenderStackData = types.model({
    stack: types.array(RenderStackEntry),
})

/**
 * Manage the rendering stack for the main viewer component
 */
class RenderStackCode extends shim(RenderStackData) {
    /**
     * Add some component into the rendering stack
     * @param name of the Rendering Layer in `Plugin:Component` form
     * @param priority Higher will be rendered first
     */
    @action
    insert (name: string, priority: number) {
        debugger
        let entry = {
            name: name,
            priority: priority,
        }
        if (this.stack.length === 0)
            this.stack.push(entry)
        else for (let i = 0; i < this.stack.length; ++i) {
            if (name === this.stack[i].name)
                break
            if (priority > this.stack[i].priority) {
                this.stack.splice(i, 0, entry)
            }
        }
    }
}

const RenderStack = mst(RenderStackCode, RenderStackData, 'RenderStack')
export default RenderStack
export type IRenderStack = typeof RenderStack.Type
