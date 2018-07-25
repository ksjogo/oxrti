import React from 'react'
import { Shaders, Node } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from '../../View/Component'
import { ComponentHook } from '../../Hook'
import PTMLRGB from './PTMLRGB'
import BaseNode from './BaseNode'

export default Component(function Stack (props) {
    let Func = new PTMLRGB().render
    let current = <Func />

    props.appState.hookForEach('ViewerRender', (hook: ComponentHook) => {
        let Func = hook.component
        current = <Func>{current}</Func>
    })

    return <Surface width={300} height={300}>
        {current}
    </Surface>
})
