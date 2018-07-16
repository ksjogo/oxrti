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
    rotation: {
        frag: rotating,
    },
})

export default Component(function Stack (props) {
    let inital = <MainObject />
    return <Surface width={300} height={300}>
        <Rotating>
            <MainObject />
        </Rotating>
    </Surface>
})

const Rotating = Component(props => {
    return <Node
        shader={shaders.rotation}
        uniformsOptions={{ children: { interpolation: 'nearest' } }}
        uniforms={{ angle: 10 + props.appState.uptime, scale: (1 + props.appState.uptime) / 20, children: props.children }}
    />
})

const MainObject = Component(props => {
    return <Node shader={shaders.noise} uniforms={{ iGlobalTime: props.appState.uptime }} />
})
