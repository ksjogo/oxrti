import React from 'react'
import { Surface } from 'gl-react-dom'
import Component from '../../View/Component'
import { ComponentHook, BaseNodeConfig } from '../../Hook'
import { IRendererPlugin } from './RendererPlugin'
import { Shaders, Node } from 'gl-react'
import { DummyRenderSize } from '../../Math'

import noise from './noise.glsl'
const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
})

export default Component<{
    onMouseLeave: (e: MouseEvent) => void,
    onMouseMove: (e: MouseEvent) => void,
    onMouseDown: (e: MouseEvent) => void,
    onMouseUp: (e: MouseEvent) => void,
}>(function Stack (props) {
    let current: JSX.Element
    let btf = props.appState.btf()

    if (!btf.isDefault()) {
        props.appState.hookForEach('RendererForModel', (hook: BaseNodeConfig) => {
            if (hook.channelModel === btf.data.channelModel) {
                let Func = hook.node.render
                current = <Func />
            }
        })
    }
    if (!current) {
        current = <Node
            height={DummyRenderSize}
            width={DummyRenderSize}
            shader={shaders.noise}
            uniforms={{ iGlobalTime: props.appState.uptime }}
        />
    }

    props.appState.hookForEach('ViewerRender', (hook: ComponentHook) => {
        let Func = hook.component
        current = <Func>{current}</Func>
    })

    let plugin = props.appState.plugins.get('RendererPlugin') as IRendererPlugin
    let size = Math.min(plugin.elementHeight, plugin.elementWidth)
    let marginXP = plugin.elementWidth > plugin.elementHeight
    let margin = Math.abs((plugin.elementHeight - plugin.elementWidth) / 2)
    return <div style={{
        marginLeft: marginXP ? margin : 0,
        marginTop: !marginXP ? margin : 0,
    }}>
        {props.appState.loadingTextures > 0 && <p>Loading {props.appState.loadingTextures} textures</p>}
        <Surface
            height={size}
            width={size}
            onMouseLeave={props.onMouseLeave}
            onMouseMove={props.onMouseMove}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
            {current}
        </Surface>
    </div>
})
