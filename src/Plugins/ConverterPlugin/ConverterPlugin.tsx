// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode, types } from '../../Plugin'
// oxrti default imports ->

import Dropzone from 'react-dropzone'
import LinearProgress from '@material-ui/core/LinearProgress'
import { Typography, Grid, Theme, createStyles } from '@material-ui/core'
import path from 'path'
import ConverterStrategy from './ConverterStrategy'
import { ConfigHook } from '../../Hook'
import ConverterStrategyConfig from './ConverterStrategyConfig'
import { readAsArrayBuffer } from 'promise-file-reader'
import IConverterUI from './ConverterUI'
import FileSaver from 'file-saver'
import { sleep } from '../../util'
import JSONDisplay, { BTFMetadataDisplay } from '../../View/JSONDisplay'

const ConverterModel = Plugin.props({
    title: 'Converter',
    progress: 0,
    statusMessage: 'No file.',
    zipName: '',
    dataHref: '',
})

class ConverterController extends shim(ConverterModel, Plugin) implements IConverterUI {

    hooks () {
        return {
            Tabs: {
                Converter: {
                    priority: 40,
                    content: ConverterView,
                    tab: {
                        label: 'Converter',
                    },
                },
            },
        }
    }

    @action
    async setMessage (message: string) {
        this.statusMessage = message
        await sleep(0)
    }

    @action
    async setProgress (progress: number) {
        this.progress = progress
        await sleep(0)
    }

    @action
    async setZipname (name: string) {
        this.zipName = name
        await sleep(0)
    }

    @action
    async setDatahref (value: string) {
        this.dataHref = value
        await sleep(0)
    }

    @action
    async onDrop (files: File[]) {
        try {
            let file = files[0]
            this.setDatahref('')
            let ending = path.extname(file.name)
            let name = path.basename(file.name, ending)
            this.setZipname(name + '.btf.zip')
            let strategy: new (...args: any[]) => ConverterStrategy
            this.appState.hookForEach('ConverterFileFormat', (hook: ConfigHook<ConverterStrategyConfig>) => {
                if (hook.fileEndings.indexOf(ending) !== -1)
                    strategy = hook.strategy
            })
            if (!strategy) {
                return this.statusMessage = `File format ${ending} is not supported at the moment`
            }
            let content = await readAsArrayBuffer(file) as ArrayBuffer
            let btf = await (new strategy(content, this)).process()
            btf.name = name
            await this.setProgress(50)
            await this.setMessage('Exporting zip.')
            let zip = await btf.generateZip()
            await this.setProgress(100)
            await this.setMessage('')
            let url = URL.createObjectURL(zip)
            this.appState.loadFile(btf)
            this.setDatahref(url)
            setTimeout(() => {
                FileSaver.saveAs(zip, this.zipName)
            }, 400)
        } catch (e) {
            console.error(e)
            this.setProgress(0)
            await this.setMessage(e.message)
        }
    }
}

const { Plugin: ConverterPlugin, Component } = PluginCreator(ConverterController, ConverterModel, 'ConverterPlugin')
export default ConverterPlugin
export type IConverterPlugin = typeof ConverterPlugin.Type

const styles = (theme: Theme) => createStyles({
    dropzone: {
        border: '1px solid ' + theme.palette.primary.main,
        width: '100%',
        height: '50px',
    },
    download: {
        color: 'green',
        height: '50px',
    },
    progress: {
        transition: 'none',
        width: '100%',
    },
})

const ConverterView = Component(function ConverterView (props, classes) {
    return <Grid container justify='center'>
        <Dropzone onDrop={this.onDrop} className={classes.dropzone}>
            <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
        <LinearProgress variant='determinate' value={this.progress} className={classes.progress} />
        <div><p>{this.statusMessage} </p></div>
        {this.dataHref &&
            <div>
                <p><a href={this.dataHref} className={classes.download} download={this.zipName} type='application/zip'>Download {this.zipName}</a></p>
                <BTFMetadataDisplay />
            </div>}
    </Grid>
}, styles)
