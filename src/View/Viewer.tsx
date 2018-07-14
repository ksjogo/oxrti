import React from 'react'
import { Shaders } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from './Component'

interface ViewerProps {
    shader: string,
    uniforms?: { [key: string]: number },
}

export default Component(function Viewer (props) {
    let shaders = Shaders.create({
        shader: {
            frag: '',
        },
    })
    // <Node shader={shaders.shader} uniforms={props.uniforms} />
    return <Surface width={300} height={300}>
    </Surface>
})
