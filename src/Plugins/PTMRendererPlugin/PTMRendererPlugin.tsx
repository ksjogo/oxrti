import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import BTFFile, { ChannelModel } from '../../BTFFile'
import { shim } from 'classy-mst'

const PTMRendererModel = Plugin.props({
})

class PTMRendererController extends shim(PTMRendererModel, Plugin) {
    get hooks () {
        return {
            RendererForModel: {
                LRGB: {
                    channelModel: 'LRGB' as ChannelModel,
                    node: PTMLRGB,
                },
                RGB: {
                    channelModel: 'RGB' as ChannelModel,
                    node: PTMRGB,
                },
            },
        }
    }
}

const { Plugin: PTMRendererPlugin, Component } = PluginCreator(PTMRendererController, PTMRendererModel, 'PTMRendererPlugin')
export default PTMRendererPlugin
export type IPTMRendererPlugin = typeof PTMRendererPlugin.Type

import { BaseNodeProps } from '../RendererPlugin/BaseNode'
import { Shaders, Node } from 'gl-react'
import { PTMFormatMetadata } from '../PTMConverterPlugin/PTMConverterStrategy'

import ptmrgbShader from './ptmrgb.glsl'
import ptmlrgbShader from './ptmlrgb.glsl'

const shaders = Shaders.create({
    ptmrgb: {
        frag: ptmrgbShader,
    },
    ptmlrgb: {
        frag: ptmlrgbShader,
    },
})

const coeffs = ['a0a1a2', 'a3a4a5']
function mapper (btf: BTFFile, name: string) {
    return coeffs.map(c => {
        return btf.texForRender(name, c)
    })
}

const PTMRGB = Component<BaseNodeProps>(function PTMRGB (props) {
    this.appState = props.appState
    let btf = props.appState.btf()
    return <Node
        shader={shaders.ptmrgb}
        width={props.width || btf.data.width}
        height={props.height || btf.data.height}
        uniforms={{
            lightPosition: props.lightPos || props.lightPos,
            texR: mapper(btf, 'R'),
            texG: mapper(btf, 'G'),
            texB: mapper(btf, 'B'),
            biases: (btf.data.formatExtra as PTMFormatMetadata).biases,
            scales: (btf.data.formatExtra as PTMFormatMetadata).scales,
        }} />
})

const PTMLRGB = Component<BaseNodeProps>(function PTMLRGB (props) {
    let btf = props.appState.btf()
    return <Node
        shader={shaders.ptmlrgb}
        width={props.width || btf.data.width}
        height={props.width || btf.data.height}
        uniforms={{
            lightPosition: props.lightPos || props.lightPos,
            texR: btf.texForRender('R', 'a0'),
            texG: btf.texForRender('G', 'a0'),
            texB: btf.texForRender('B', 'a0'),
            texL0: btf.texForRender('L', 'a0'),
            texL1: btf.texForRender('L', 'a1'),
            texL2: btf.texForRender('L', 'a2'),
            texL3: btf.texForRender('L', 'a3'),
            texL4: btf.texForRender('L', 'a4'),
            texL5: btf.texForRender('L', 'a5'),
            biases: (btf.data.formatExtra as PTMFormatMetadata).biases,
            scales: (btf.data.formatExtra as PTMFormatMetadata).scales,
        }} />
})
