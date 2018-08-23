import { types } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import { HookName, HookType } from './Hook'
import { IPlugin } from './Plugin'

/** single hook entry */
const HookEntry = types.model({
    name: types.string,
    priority: types.number,
})

/** the hook manager is keeping a sorted stack of hooks */
const HookManagerData = types.model({
    stack: types.optional(types.array(HookEntry), []),
})

const ShimHookManager = shim(HookManagerData)
/** %begin */

/** type definitions for the different iterators */
export type HookIterator<P extends HookName> = (hook: HookType<P>, fullName: string) => boolean | void
export type AsyncHookIterator<P extends HookName> = (hook: HookType<P>, fullName: string) => Promise<boolean | void>
export type HookMapper<P extends HookName, S> = (hook: HookType<P>, fullName: string) => S
export type HookFind<P extends HookName, S> = (hook: HookType<P>, fullName: string) => S

/** * Manage one named hook */
export class HookManagerCode extends ShimHookManager {
    /**
     * Add some hook into the managed stack
     * @param name in `Plugin$Hookname$Entryname` form
     * @param priority higher will be treated first with the iterators
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

    /** Iterate with iterator over all registered hooks, stop iteration if the iterator is returning true, name is redundant as it could be inferred from ourselves, but allows for easy typesafe calling, appState is needed to retrieve the current plugin instance */
    forEach<P extends HookName> (iterator: HookIterator<P>, name: P, appState: IAppState) {
        for (let i = 0; i < this.stack.length; i++) {
            let hook = this.stack[i]
            let instance = hook.name.split('$')
            let plugin: IPlugin = appState.plugins.get(instance[0])
            if (iterator(plugin.hook(name, instance[2]), hook.name))
                break
        }
    }

    /** iterate over all hooks, but wait for asynchronous hooks to finish before executing the next one */
    async asyncForEach<P extends HookName> (iterator: AsyncHookIterator<P>, name: P, appState: IAppState): Promise<void> {
        for (let i = 0; i < this.stack.length; i++) {
            let hook = this.stack[i]
            let instance = hook.name.split('$')
            let plugin: IPlugin = appState.plugins.get(instance[0])
            if (await iterator(plugin.hook(name, instance[2]), hook.name))
                break
        }
    }

    /** iterate in reverse order */
    forEachReverse<P extends HookName> (iterator: HookIterator<P>, name: P, appState: IAppState) {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let hook = this.stack[i]
            let instance = hook.name.split('$')
            let plugin = appState.plugins.get(instance[0])
            if (iterator(plugin.hook(name, instance[2]), hook.name))
                break
        }
    }

    /** map over all hooks */
    map<S, P extends HookName> (mapper: HookMapper<P, S>, name: HookName, appState: IAppState): S[] {
        let result: S[] = []
        this.forEach((hook, fullName) => {
            result.push(mapper(hook, fullName))
        }, name, appState)
        return result
    }

    /** get the concrete hook at index number */
    pick<P extends HookName> (index: number, name: P, appState: IAppState): HookType<P> {
        let hook = this.stack[index]
        let instance = hook.name.split('$')
        let plugin = appState.plugins.get(instance[0])
        return plugin.hook(name, instance[2])
    }
}
/** %end */

const RenderStack = mst(HookManagerCode, HookManagerData, 'HookManager')
export default RenderStack
export type IRenderStack = typeof RenderStack.Type

import { IAppState } from './AppState'
