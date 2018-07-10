import React from 'react'
import { Shaders, Node } from 'gl-react'
import { Surface } from 'gl-react-dom'

interface GLViewProps {
    shader: string,
    uniforms?: { [key: string]: number },
}

const GLView: React.SFC<GLViewProps> = (props) => {
    let shaders = Shaders.create({
        shader: {
            frag: props.shader,
        },
    })
    return <Surface width={300} height={300}>
        <Node shader={shaders.shader} uniforms={props.uniforms} />
    </Surface>
}

export default GLView
