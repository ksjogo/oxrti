import React from 'react'
import { Shaders } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from './Component'
import PluginRender from './PluginRender'

interface ConverterProps {
}

export default Component<ConverterProps>(function Converter (props) {
    return <h1>Converter</h1>
})
