import React from 'react'
import { Shaders, Node } from 'gl-react'
import { Surface } from 'gl-react-dom'
import noise from '../Plugins/TestPlugin/shader.glsl'
import rotating from './rotating.glsl'
import Component from './Component'

export default Component(function Stack (props) {
    let shaders = Shaders.create({
        noise: {
            frag: noise,
        },
        rotation: {
            frag: rotating,
        },
    })
    return <Surface width={300} height={300}>
        <Rotating>
            <Node shader={shaders.noise} uniforms={{ iGlobalTime: props.appState.uptime }} />
        </Rotating>
    </Surface>
})

export const Rotating = Component(props => {
    let shaders = Shaders.create({
        rotation: {
            frag: rotating,
        },
    })
    return <Node
        shader={shaders.rotation}
        uniformsOptions={{ children: { interpolation: 'nearest' } }}
        uniforms={{ angle: 10 + props.appState.uptime, scale: (1 + props.appState.uptime) / 20, children: props.children }}
    />
})
