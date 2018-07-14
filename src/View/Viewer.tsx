import React from 'react'
import { Shaders, Node } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from './Component'

interface ViewerProps {
    shader: string,
    uniforms?: { [key: string]: number },
}

export default Component(function Viewer (props) {
    let shaders = Shaders.create({
        shader: {
            frag: props.shader,
        },
    })
    return <Surface width={300} height={300}>
        <Node shader={shaders.shader} uniforms={props.uniforms} />
    </Surface>
})
