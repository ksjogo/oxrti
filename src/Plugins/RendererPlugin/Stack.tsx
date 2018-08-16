import React from 'react'
import { Surface } from 'gl-react-dom'
import Component from '../../View/Component'
import { IRendererPlugin } from './RendererPlugin'
import { Shaders, Node, LinearCopy, NearestCopy } from 'gl-react'
import { Switch, Theme, createStyles, Button, Popover, Card, CardContent, CardActions, Typography } from '@material-ui/core'

import noise from './noise.glsl'
const shaders = Shaders.create({
    noise: {
        frag: noise,
    },
})

const styles = (theme: Theme) => createStyles({
    surface: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
    },
})

export default Component<{
    surfaceRef: (ref: typeof Surface) => void,
    onMouseLeave: (e: MouseEvent) => void,
    onMouseMove: (e: MouseEvent) => void,
    onMouseDown: (e: MouseEvent) => void,
    onMouseUp: (e: MouseEvent) => void,
}>(function Stack (props, classes) {
    let plugin = props.appState.plugins.get('RendererPlugin') as IRendererPlugin
    let size = Math.min(plugin.elementHeight, plugin.elementWidth)
    let marginXP = plugin.elementWidth > plugin.elementHeight
    let margin = Math.abs((plugin.elementHeight - plugin.elementWidth) / 2)

    let current: JSX.Element
    let btf = props.appState.btf()

    if (!btf.isDefault()) {
        props.appState.hookForEach('RendererForModel', (hook) => {
            if (hook.channelModel === btf.data.channelModel) {
                let Func = hook.node.render
                current = <Func key={btf.id} />
            }
        })
    }
    if (!current) {
        current = <Node
            key={btf.id}
            height={size}
            width={size}
            shader={shaders.noise}
            uniforms={{ iGlobalTime: props.appState.uptime }}
        />
    }

    props.appState.hookForEach('ViewerRender', (hook) => {
        let Func = hook.component
        current = <Func
            // flush layer if the btf file changed
            key={btf.id}
        >{current}</Func>
    })

    return <div style={{
        marginLeft: marginXP ? margin : 0,
        marginTop: !marginXP ? margin : 0,
    }}>
        <Surface
            ref={props.surfaceRef}
            className={classes.surface}
            height={size}
            width={size}
            onMouseLeave={props.onMouseLeave}
            onMouseMove={props.onMouseMove}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            webglContextAttributes={{ preserveDrawingBuffer: true }}
        ><LinearCopy>
                {current}
            </LinearCopy>
        </Surface>
    </div>
}, styles)
