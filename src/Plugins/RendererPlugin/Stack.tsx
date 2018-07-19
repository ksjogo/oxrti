import React from 'react'
import { Shaders, Node } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from '../../View/Component'
import { ComponentHook } from '../../Hook'

import noise from './shader.glsl'

const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
})

export default Component(function Stack (props) {
    let current = <MainObject />
    props.appState.hookForEach('ViewerRender', (hook: ComponentHook) => {
        let Func = hook.component
        current = <Func>{current}</Func>
    })
    return <Surface width={300} height={300}>
        {current}
    </Surface>
})

const MainObject = Component(props => {
    return <Node shader={shaders.noise} uniforms={{ iGlobalTime: props.appState.uptime }} />
})
