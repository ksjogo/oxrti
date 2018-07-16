import React from 'react'
import Component from './Component'
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'
import RenderHooks from './RenderHooks'

interface ViewerProps {
}

export default Component<ViewerProps>(function Viewer (props) {
    return <Grid container spacing={16}>
        <Grid item xs={8}>
            <Stack />
        </Grid>

        <Grid item xs={4}>
            <h1>Oxrti</h1>
            <p>Uptime: {props.appState.uptime}</p>
            {
                <RenderHooks name='ViewerSide' />
            }
        </Grid>
    </Grid>
})
