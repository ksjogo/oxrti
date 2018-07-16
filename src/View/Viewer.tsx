import React from 'react'
import Component from './Component'
import Grid from '@material-ui/core/Grid'
import Stack from './Stack'

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
                props.appState.viewerSideHooks.map(component => {
                    let name = component.split(':')
                    let Func = props.appState.plugins.get(name[0] + 'Plugin').component(name[1])
                    return <Func key={component} />
                })
            }
        </Grid>
    </Grid>
})
