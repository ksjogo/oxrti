import React from 'react'
import { Shaders } from 'gl-react'
import { Surface } from 'gl-react-dom'
import Component from './Component'
import Grid from '@material-ui/core/Grid'
import PluginRender from './PluginRender'
import GLView from './GLView'
import shader2 from './test.glsl'
import shader from '../Plugins/TestPlugin/shader.glsl'
import Stack from './Stack'

interface ViewerProps {
}

export default Component<ViewerProps>(function Viewer (props) {
    return <Grid container spacing={16}>
        <Grid item xs={8}>
            {/*   <GLView shader={shader} uniforms={{ iGlobalTime: props.appState.uptime }} />
            <GLView shader={shader2} uniforms={{ blue: 1 }} /> */}
            <Stack />
        </Grid>

        <Grid item xs={4}>
            Item Two
            <p >Welcome home</p>
            <h1>Oxrti</h1>
            <p>Build 4 </p>
            <p>{props.appState.uptime}</p>
            {/*             <PluginRender name='Test:Test' />
 */}        </Grid>
    </Grid>
})
