import Component from './Component'
import React from 'react'
import { HookNameComponent, ComponentHook } from '../Hook'

/**
 * Simple plugin rendering function
 * Will split on ':' and then look up the respective component from within the plugin tree
 */
export default Component<{ name: HookNameComponent }>(function RenderHooks (props) {
    let rendered = props.appState.hookMap(props.name, (hook: ComponentHook, fullName: string) => {
        let Func = hook.component
        return <Func key={fullName} />
    })
    return <>{rendered}</>
})
