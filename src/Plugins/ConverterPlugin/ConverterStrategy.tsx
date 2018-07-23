import IConverterUI from './ConverterUI'
import JSZip from 'jszip'
import { sleep } from '../../util'

export type Channels = { [key: string]: Channel }
export type Channel = { [key: string]: Coefficent }
export type Coefficent = {
    data: Buffer,
    fileformat: string,
}

export default abstract class ConverterStrategy {
    view: Uint8Array | Int8Array = null
    content: ArrayBuffer = null
    ui: IConverterUI

    width = 0
    height = 0

    get pixels () {
        return this.width * this.height
    }

    constructor (content: ArrayBuffer, ui: IConverterUI) {
        this.ui = ui
        this.content = content
        this.view = this.createView()
    }

    abstract createView ()

    currentIndex = 0
    readTillNewLine () {
        let str = ''
        while (true) {
            if (this.currentIndex >= this.view.length)
                throw new Error('Reached end of file before newline')
            let next = String.fromCharCode(this.view[this.currentIndex++])
            if (next !== '\n')
                str += next
            else
                break
        }
        return str
    }

    readOne (progress = true) {
        if (this.currentIndex >= this.view.length) {
            debugger
            throw new Error('Reached end of file prematurely!')
        }

        return this.view[this.currentIndex++]
    }

    async process (): Promise<Blob> {
        await this.ui.setProgress(0)
        await this.ui.setMessage('Parsing metadata.')
        await this.parseMetadata()
        await this.ui.setMessage('Reading pixels.')
        await this.readPixels()
        await this.readSuffix()
        if (this.currentIndex !== this.view.length)
            throw new Error('we missed some data!')
        await this.ui.setMessage('Bundling channels.')
        await this.bundleChannels()
        await this.ui.setMessage('Generating zip.')
        await this.ui.setProgress(0)
        let zip = new JSZip()
        await this.fillZip(zip)
        await this.ui.setProgress(50)
        await this.ui.setMessage('Exporting zip.')
        let ret = await zip.generateAsync({ type: 'blob' })
        await this.ui.setMessage('')
        await this.ui.setProgress(100)
        await sleep(0)
        return Promise.resolve(ret)
    }

    abstract async parseMetadata ()
    abstract async readPixels ()
    abstract async readSuffix ()

    channels: Channels
    abstract async bundleChannels ()

    async fillZip (zip: JSZip) {
        let dataFolder = zip.folder('data')
        for (const channelName in this.channels) {
            let channelFolder = dataFolder.folder(channelName)
            for (const coefficentName in this.channels[channelName]) {
                let coefficent = this.channels[channelName][coefficentName]
                channelFolder.file(`${coefficentName}.${coefficent.fileformat}`, coefficent.data)
            }
        }
        let manifest = await this.generateManifest()
        zip.file('manifest.json', manifest)
    }

    async generateManifest (): Promise<string> {
        return Promise.resolve(JSON.stringify({
            data: null,
            width: this.width,
            height: this.height,
        }, null, 2))
    }
}
