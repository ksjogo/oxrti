import { types } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import { FunctionHook, ComponentHook, HookName, ConfigHook, HookType } from '../Hook'

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

export type HookIterator<P extends HookName> = (hook: HookType<P>, fullName?: string) => boolean | void
export type AsyncHookIterator<P extends HookName> = (hook: HookType<P>, fullName?: string) => Promise<boolean | void>
export type HookMapper<P extends HookName, S> = (hook: HookType<P>, fullName?: string) => S
export type HookFind<P extends HookName, S> = (hook: HookType<P>, fullName?: string) => S
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
        if (this.stack.length === 0) {
            this.stack.push(entry)
        } else {
            // kill old entries of same name if priority changed)
            for (let i = 0; i < this.stack.length; ++i) {
                if (this.stack[i].name === name) {
                    if (this.stack[i].priority !== priority)
                        this.stack.splice(i, 1)
                    else // priority stayed the same, so we leave the hook alone
                        return
                }
            }
            // insert at place
            for (let i = 0; i < this.stack.length; ++i) {
                if (priority >= this.stack[i].priority) {
                    this.stack.splice(i, 0, entry)
                    break
                }
                if (i === this.stack.length - 1) {
                    this.stack.push(entry)
                    break
                }
            }
        }
    }

    forEach<P extends HookName> (iterator: HookIterator<P>, name: P, appState: IAppState) {
        for (let i = 0; i < this.stack.length; i++) {
            let hook = this.stack[i]
            let instance = hook.name.split('$')
            let plugin = appState.plugins.get(instance[0])
            if (iterator(plugin.hook(name, instance[2]), hook.name))
                break
        }
    }

    async asyncForEach<P extends HookName> (iterator: AsyncHookIterator<P>, name: P, appState: IAppState): Promise<void> {
        for (let i = 0; i < this.stack.length; i++) {
            let hook = this.stack[i]
            let instance = hook.name.split('$')
            let plugin = appState.plugins.get(instance[0])
            if (await iterator(plugin.hook(name, instance[2]), hook.name))
                break
        }
    }

    forEachReverse<P extends HookName> (iterator: HookIterator<P>, name: P, appState: IAppState) {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let hook = this.stack[i]
            let instance = hook.name.split('$')
            let plugin = appState.plugins.get(instance[0])
            if (iterator(plugin.hook(name, instance[2]), hook.name))
                break
        }
    }

    map<S, P extends HookName> (mapper: HookMapper<P, S>, name: HookName, appState: IAppState): S[] {
        let result = []
        this.forEach((hook, fullName) => {
            result.push(mapper(hook, fullName))
        }, name, appState)
        return result
    }

    pick<P extends HookName> (index: number, name: P, appState: IAppState): HookType<P> {
        let hook = this.stack[index]
        let instance = hook.name.split('$')
        let plugin = appState.plugins.get(instance[0])
        return plugin.hook(name, instance[2])
    }
}

const RenderStack = mst(HookManagerCode, HookManagerData, 'HookManager')
export default RenderStack
export type IRenderStack = typeof RenderStack.Type
