import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import Dropzone from 'react-dropzone'
import LinearProgress from '@material-ui/core/LinearProgress'
import { Typography, Grid, Theme, Card, Button, createStyles, CardContent, List, ListItem } from '@material-ui/core'
import path from 'path'
import ConverterStrategy from './ConverterStrategy'
import { readAsArrayBuffer } from 'promise-file-reader'
import IConverterUI from './ConverterUI'
import FileSaver from 'file-saver'
import { sleep } from '../../util'
import { BTFMetadataDisplay } from '../BasePlugin/BasePlugin'

const ConverterModel = Plugin.props({
})

class ConverterController extends shim(ConverterModel, Plugin) implements IConverterUI {
    progress = 0
    statusMessage = 'No file.'
    zipName = ''
    dataHref = ''

    get hooks () {
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
        this.progress = Math.trunc(progress)
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
            let strategy: new (...args: any[]) => ConverterStrategy
            this.appState.hookForEach('ConverterFileFormat', (hook) => {
                if (hook.fileEndings.indexOf(ending) !== -1)
                    strategy = hook.strategy
            })
            if (!strategy) {
                return this.statusMessage = `File format ${ending} is not supported at the moment`
            }
            let content = await readAsArrayBuffer(file)
            let btf = await (new strategy(content, this)).process()
            btf.name = name
            this.setZipname(btf.zipName())
            await this.setProgress(50)
            await this.setMessage('Exporting zip.')
            let zip = await btf.generateZip()
            await this.setProgress(100)
            await this.setMessage('')
            let url = URL.createObjectURL(zip)
            this.appState.loadFile(btf, false)
            this.setDatahref(url)
            setTimeout(() => {
                FileSaver.saveAs(zip, this.zipName)
            }, 400)
        } catch (e) {
            console.error(e)
            this.setProgress(0)
            await this.setMessage(e.message)
        }
        return Promise.resolve()
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
    dropcard: {
        width: '100%',
        'text-align': 'center',
    },
    progress: {
        transition: 'none',
        width: 'calc(100% + 2px)',
    },
    displayCard: {
        width: '100%',
    },
})

const ConverterView = Component(function ConverterView (props, classes) {
    return <List>
        <ListItem>
            <Card className={classes.dropcard}>
                <CardContent>
                    <Dropzone onDrop={this.onDrop} className={classes.dropzone}>
                        <div>Try dropping some files here, or click to select files to upload.</div>
                    </Dropzone>
                    <LinearProgress variant='determinate' value={this.progress} className={classes.progress} />
                    <div><p>{this.statusMessage} </p></div>
                    {this.dataHref &&
                        <Button variant='contained' className={classes.download} download={this.zipName} type='application/zip' href={this.dataHref}>
                            Download {this.zipName}
                        </Button>}
                </CardContent>
            </Card>
        </ListItem>
        {this.dataHref &&
            <ListItem>
                <Card className={classes.displayCard}>
                    <CardContent>
                        <BTFMetadataDisplay />
                    </CardContent>
                </Card>
            </ListItem>
        }
    </List>
}, styles)
