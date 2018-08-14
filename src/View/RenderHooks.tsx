import Component from './Component'
import React from 'react'
import { HookNameComponent } from '../Hook'

/**
 * Simple plugin rendering function
 * Will split on ':' and then look up the respective component from within the plugin tree
 */
export default Component<{ name: HookNameComponent }>(function RenderHooks (props) {
    let rendered = props.appState.hookMap(props.name, (hook, fullName) => {
        let Func = hook.component
        return <Func key={fullName} />
    })
    return <>{rendered}</>
})
