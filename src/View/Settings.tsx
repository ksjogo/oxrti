import React from 'react'
import { Shaders } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from './Component'
import PluginRender from './PluginRender'

interface SettingsProps {
}

export default Component<SettingsProps>(function Settings (props) {
    return <h1>Settings</h1>
})