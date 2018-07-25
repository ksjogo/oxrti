import BaseNode from './BaseNode'
import React from 'react'
import Component from '../../View/Component'
import { Shaders, Node } from 'gl-react'

import noise from './shader.glsl'

const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
})

export default class PTMLRGB extends BaseNode {
    render = Component(props => {
        if (!props.appState.btf())
            return <Node shader={shaders.noise} uniforms={{ iGlobalTime: props.appState.uptime }} />

        return <Node shader={shaders.noise} uniforms={{ iGlobalTime: 0 }} />
    })
}
