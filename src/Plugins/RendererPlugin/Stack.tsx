import React from 'react'
import { Surface } from 'gl-react-dom'
import Component from '../../View/Component'
import { ComponentHook } from '../../Hook'
import PTMLRGB from './PTMLRGB'
import { IRendererPlugin } from './RendererPlugin'
import { Shaders, Node } from 'gl-react'

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
    if (!props.appState.btf()) {
        current = <Node
            height={300}
            width={300}
            shader={shaders.noise}
            uniforms={{ iGlobalTime: props.appState.uptime }}
        />

    } else {
        let Func = new PTMLRGB().render
        current = <Func />
    }
    props.appState.hookForEach('ViewerRender', (hook: ComponentHook) => {
        let Func = hook.component
        current = <Func>{current}</Func>
    })

    let btf = props.appState.btf()
    let plugin = props.appState.plugins.get('RendererPlugin') as IRendererPlugin
    return <div>
        {props.appState.loadingTextures > 0 && <p>Loading {props.appState.loadingTextures} textures</p>}
        <Surface
            height={plugin.elementHeight}
            width={plugin.elementWidth}
            onMouseLeave={props.onMouseLeave}
            onMouseMove={props.onMouseMove}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}>>
            {current}
        </Surface>
    </div>
})
