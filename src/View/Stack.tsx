import React from 'react'
import { Shaders, Node } from 'gl-react'
import { Surface } from 'gl-react-dom'
import noise from '../Plugins/TestPlugin/shader.glsl'
import rotating from './rotating.glsl'
import Component from './Component'
import { propTypes } from 'mobx-react'

const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
})

export default Component(function Stack (props) {
    let current = <MainObject />
    props.appState.renderStack.stack.forEach(entry => {
        let name = entry.name.split(':')
        let Func = props.appState.plugins.get(name[0] + 'Plugin').component(name[1])
        current = <Func>{current}</Func>
    })
    return <Surface width={300} height={300}>
        {current}
    </Surface>
})

const MainObject = Component(props => {
    return <Node shader={shaders.noise} uniforms={{ iGlobalTime: props.appState.uptime }} />
})
