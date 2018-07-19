// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->

import Dropzone from 'react-dropzone'
import LinearProgress from '@material-ui/core/LinearProgress'
import { Typography, Grid, Theme } from '@material-ui/core'
import createStyled from 'material-ui-render-props-styles'

const ConverterModel = Plugin.props({
    title: 'Converter',
    progress: 0,
})

class ConverterController extends shim(ConverterModel, Plugin) {
    hooks () {
        return {
            Tabs: {
                Converter: {
                    priority: 10,
                    config: {
                        content: ConverterView,
                        tab: {
                            label: 'Converter',
                        },
                    },
                },
            },
        }
    }

    onDrop (files: any) {
        console.log(files)
    }
}

const { Plugin: ConverterPlugin, Component } = PluginCreator(ConverterController, ConverterModel, 'ConverterPlugin')
export default ConverterPlugin

const Styled = createStyled((theme: Theme) => {
    return {
        dropzone: {
            border: '1px solid ' + theme.palette.primary.main,
            width: '100%',
            height: '50px',
        },
    }
})

const ConverterView = Component(function ConverterView (props) {
    return <Styled>
        {({ classes }) => (

            < Typography component='div' style={{
                padding: 8 * 3,
            }} >
                <Grid container justify='center'>
                    <Dropzone onDrop={(files) => this.onDrop(files)} className={classes.dropzone}>
                        <div>Try dropping some files here, or click to select files to upload.</div>
                    </Dropzone>
                    <LinearProgress variant='determinate' value={this.progress} style={{
                        width: '100%',
                    }} />
                </Grid>
            </Typography >
        )}
    </Styled>

})
