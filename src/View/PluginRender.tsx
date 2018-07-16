import Component from './Component'
import React from 'react'

/**
 * Simple plugin rendering function
 * Will split on ':' and then look up the respective component from within the plugin tree
 */
export default Component<{ name: string }>(function PluginRender (props) {
    let [pluginName, componentName] = props.name.split(':')
    let Plugin = props.appState.plugins.get(pluginName).component(componentName)
    return <Plugin />
})
