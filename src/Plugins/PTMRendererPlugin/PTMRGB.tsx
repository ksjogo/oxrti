import BaseNode, { BaseExtraProps } from '../RendererPlugin/BaseNode'
import React from 'react'
import Component from '../../View/Component'
import { Shaders, Node } from 'gl-react'

import standard from './ptmrgb.glsl'
import { PTMFormatMetadata } from '../PTMConverterPlugin/PTMConverterStrategy'
import BTFFile from '../../BTFFile'

const shaders = Shaders.create({
    ptmrgb: {
        frag: standard,
    },
})

const coeffs = ['a0a1a2', 'a3a4a5']
function mapper (btf: BTFFile, name: string) {
    return coeffs.map(c => {
        return btf.texForRender(name, c)
    })
}

export default class PTMRGB extends BaseNode {
    render = Component<BaseExtraProps>(props => {
        this.appState = props.appState
        let btf = props.appState.btf()
        return <Node
            shader={shaders.ptmrgb}
            width={props.width || btf.data.width}
            height={props.height || btf.data.height}
            uniforms={{
                lightPosition: props.lightPos || this.lightPos(),
                texR: mapper(btf, 'R'),
                texG: mapper(btf, 'G'),
                texB: mapper(btf, 'B'),
                biases: (btf.data.formatExtra as PTMFormatMetadata).biases,
                scales: (btf.data.formatExtra as PTMFormatMetadata).scales,
            }} />
    })
}
