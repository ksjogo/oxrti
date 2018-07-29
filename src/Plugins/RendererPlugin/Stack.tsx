import React from 'react'
import { Surface } from 'gl-react-dom'
import Component from '../../View/Component'
import { ComponentHook } from '../../Hook'
import PTMLRGB from './PTMLRGB'
import { IRendererPlugin } from './RendererPlugin'

export default Component<{
}>(function Stack (props) {

    let Func = new PTMLRGB().render
    let current = <Func />

    props.appState.hookForEach('ViewerRender', (hook: ComponentHook) => {
        let Func = hook.component
        current = <Func>{current}</Func>
    })

    let btf = props.appState.btf()
    let plugin = props.appState.plugins.get('RendererPlugin') as IRendererPlugin
    return <div>
        {props.appState.loadingTextures > 0 && <p>Loading {props.appState.loadingTextures} textures</p>}
        <Surface height={plugin.elementHeight} width={plugin.elementWidth}>
            {current}
        </Surface>
    </div>
})
