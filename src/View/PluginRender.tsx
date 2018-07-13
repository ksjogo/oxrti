import Component from './Component'
import React from 'react'

/**
 *
 */
export default Component<{ name: string }>(function PluginRender (props) {
    let [pluginName, componentName] = props.name.split(':')
    let Plugin = props.appState.plugins.get(pluginName).component(componentName)
    return <Plugin />
})
