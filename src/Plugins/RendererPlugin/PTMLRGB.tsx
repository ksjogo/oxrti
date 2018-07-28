import BaseNode from './BaseNode'
import React from 'react'
import Component from '../../View/Component'
import { Shaders, Node } from 'gl-react'

import noise from './noise.glsl'
import standard from './ptmlrgb.glsl'
import { PTMFormatMetadata } from '../PTMConverterPlugin/PTMConverterStrategy'

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
        this.appState = props.appState
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
                lightPosition: this.lightPos(),
                texR: btf.texForRender('R', 'a0'),
                texG: btf.texForRender('G', 'a0'),
                texB: btf.texForRender('B', 'a0'),
                texL0: btf.texForRender('L', 'a0'),
                texL1: btf.texForRender('L', 'a1'),
                texL2: btf.texForRender('L', 'a2'),
                texL3: btf.texForRender('L', 'a3'),
                texL4: btf.texForRender('L', 'a4'),
                texL5: btf.texForRender('L', 'a5'),
                biases: (btf.formatMetadata as PTMFormatMetadata).biases,
                scales: (btf.formatMetadata as PTMFormatMetadata).scales,
            }} />
    })
}
