import BaseNode from './BaseNode'
import React from 'react'
import Component from '../../View/Component'
import { Shaders, Node } from 'gl-react'

import noise from './noise.glsl'
import standard from './ptmlrgb.glsl'

const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
    ptmlrgb: {
        frag: standard,
    },
})

export default class PTMLRGB extends BaseNode {
    render = Component(props => {
        if (!props.appState.btf())
            return <Node
                shader={shaders.noise}
                uniforms={{ iGlobalTime: props.appState.uptime }}
            />

        let btf = props.appState.btf()

        return <Node
            shader={shaders.ptmlrgb}
            width={btf.width}
            height={btf.height}
            uniforms={{
                texR: btf.texUrl(btf.channels.R.R),
                texG: btf.texUrl(btf.channels.G.G),
                texB: btf.texUrl(btf.channels.B.B),
                texL0: btf.texUrl(btf.channels.L.a0),
                texL1: btf.texUrl(btf.channels.L.a1),
                texL2: btf.texUrl(btf.channels.L.a2),
                texL3: btf.texUrl(btf.channels.L.a3),
                texL4: btf.texUrl(btf.channels.L.a4),
                texL5: btf.texUrl(btf.channels.L.a5),
            }} />
    })
}
