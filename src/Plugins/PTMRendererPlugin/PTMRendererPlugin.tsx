import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import BTFFile, { ChannelModel } from '../../BTFFile'
import { shim } from 'classy-mst'
import _ from 'lodash'

const PTMRendererModel = Plugin.props({
})

const LRGBRenderingModes = ['default', 'Normals X', 'Normals Y', 'Normals Z', 'Normals Falsecolor']

class PTMRendererController extends shim(PTMRendererModel, Plugin) {
    get hooks () {
        return {
            RendererForModel: {
                LRGB: {
                    channelModel: 'LRGB' as ChannelModel,
                    renderingModes: LRGBRenderingModes,
                    node: PTMLRGB,
                },
                RGB: {
                    channelModel: 'RGB' as ChannelModel,
                    renderingModes: ['default'],
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
import ptmlrgbNormalsShader from './ptmlrgb_normals.glsl'

const shaders = Shaders.create({
    ptmrgb: {
        frag: ptmrgbShader,
    },
    ptmlrgb: {
        frag: ptmlrgbShader,
    },
    ptmlrgbNormals: {
        frag: ptmlrgbNormalsShader,
    },
})

/** %begin */
const coeffs = ['a0a1a2', 'a3a4a5']
// return a texture configuration array for the given coefficent
function mapper (btf: BTFFile, name: string) {
    return coeffs.map(c => {
        return btf.texForRender(name, c)
    })
}

// render a RGB object
const PTMRGB = Component<BaseNodeProps>(function PTMRGB (props) {
    let btf = props.appState.btf()
    return <Node
        // from ./ptmrgb.glsl
        shader={shaders.ptmrgb}
        // adaptive sizing if wanted
        width={props.width || btf.data.width}
        height={props.height || btf.data.height}
        uniforms={{
            // usually coming from the lightcontrol plugin, is [x:number, y:number, z:number]
            lightPosition: props.lightPos,
            // texture arrays
            texR: mapper(btf, 'R'),
            texG: mapper(btf, 'G'),
            texB: mapper(btf, 'B'),
            // retrieve the untyped formatExtra
            biases: (btf.data.formatExtra as PTMFormatMetadata).biases,
            scales: (btf.data.formatExtra as PTMFormatMetadata).scales,
        }} />
})
/** %end */

const PTMLRGB = Component<BaseNodeProps>(function PTMLRGB (props) {
    let btf = props.appState.btf()
    let shader: string = ''
    let extraUniforms: any = {}
    if (props.renderingMode === 'default') {
        shader = shaders.ptmlrgb
        extraUniforms = {
            lightPosition: props.lightPos,
            texR: btf.texForRender('R', 'a0'),
            texG: btf.texForRender('G', 'a0'),
            texB: btf.texForRender('B', 'a0'),
        }
    } else {
        shader = shaders.ptmlrgbNormals
        let mode = 0
        extraUniforms = {
            mode: LRGBRenderingModes.indexOf(props.renderingMode),
        }
    }
    return <Node
        shader={shader}
        width={props.width || btf.data.width}
        height={props.width || btf.data.height}
        uniforms={_.extend({
            texL0: btf.texForRender('L', 'a0'),
            texL1: btf.texForRender('L', 'a1'),
            texL2: btf.texForRender('L', 'a2'),
            texL3: btf.texForRender('L', 'a3'),
            texL4: btf.texForRender('L', 'a4'),
            texL5: btf.texForRender('L', 'a5'),
            biases: (btf.data.formatExtra as PTMFormatMetadata).biases,
            scales: (btf.data.formatExtra as PTMFormatMetadata).scales,
        }, extraUniforms)} />
})
