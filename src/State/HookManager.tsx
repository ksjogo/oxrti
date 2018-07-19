import { types } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import { FunctionHook, ComponentHook, HookName, ConfigHook } from '../Hook'

// circular dependency at the moment
type IAppState = any

/**
 * Single entry
 */
const HookEntry = types.model({
    name: types.string,
    priority: types.number,
})

/**
 * Keeping track of all entries
 */
const HookManagerData = types.model({
    stack: types.optional(types.array(HookEntry), []),
})

export type HookIterator = (hook: ComponentHook | FunctionHook | ConfigHook, fullName?: string) => void
export type HookMapper<S> = (hook: ComponentHook | FunctionHook | ConfigHook, fullName?: string) => S
/**
 * Manage the rendering stack for the main viewer component
 */
class HookManagerCode extends shim(HookManagerData) {
    /**
     * Add some component into the rendering stack
     * @param name of the Rendering Layer in `Plugin:Component` form
     * @param priority Higher will be rendered first
     */
    @action
    insert (name: string, priority: number = 0) {
        let entry = {
            name: name,
            priority: priority,
        }
        if (this.stack.length === 0)
            this.stack.push(entry)
        else for (let i = 0; i < this.stack.length; ++i) {
            if (name === this.stack[i].name)
                break
            if (priority >= this.stack[i].priority) {
                this.stack.splice(i, 0, entry)
                break
            }
            if (i === this.stack.length - 1)
                this.stack.push(entry)
        }
    }

    forEach (iterator: HookIterator, name: HookName, appState: IAppState) {
        this.stack.forEach(hook => {
            let instance = hook.name.split('$')
            let plugin = appState.plugins.get(instance[0])
            iterator(plugin.hook(name, instance[2]), hook.name)
        })
    }

    map<S> (mapper: HookMapper<S>, name: HookName, appState: IAppState): S[] {
        let result = []
        this.forEach((hook, fullName) => {
            result.push(mapper(hook, fullName))
        }, name, appState)
        return result
    }

    pick<S> (index: number, name: HookName, appState: IAppState): S {
        let hook = this.stack[index]
        let instance = hook.name.split('$')
        let plugin = appState.plugins.get(instance[0])
        return plugin.hook(name, instance[2])
    }
}

const RenderStack = mst(HookManagerCode, HookManagerData, 'HookManager')
export default RenderStack
export type IRenderStack = typeof RenderStack.Type
