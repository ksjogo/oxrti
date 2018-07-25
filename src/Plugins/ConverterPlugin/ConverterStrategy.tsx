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
    fileBuffer: ArrayBuffer
    inputBuffer: Buffer
    ui: IConverterUI
    pixelData: Buffer

    width = 0
    height = 0

    get pixels () {
        return this.width * this.height
    }

    constructor (content: ArrayBuffer, ui: IConverterUI) {
        this.ui = ui
        this.fileBuffer = content
        this.inputBuffer = new Buffer(content)
    }

    currentIndex = 0
    readTillNewLine () {
        let str = ''
        while (true) {
            if (this.currentIndex >= this.inputBuffer.length)
                throw new Error('Reached end of file before newline')
            let next = String.fromCharCode(this.inputBuffer[this.currentIndex++])
            if (next !== '\n')
                str += next
            else
                break
        }
        return str
    }

    readOne () {
        if (this.currentIndex >= this.inputBuffer.length) {
            throw new Error('Reached end of file prematurely!')
        }

        return this.inputBuffer[this.currentIndex++]
    }

    async preparePixelData () {
        this.pixelData = Buffer.from(this.fileBuffer, this.currentIndex)
        this.currentIndex += this.fileBuffer.byteLength - this.currentIndex
    }

    async process (): Promise<Blob> {
        await this.ui.setProgress(0)
        await this.ui.setMessage('Parsing metadata.')
        await this.parseMetadata()
        await this.preparePixelData()
        await this.ui.setMessage('Reading pixels.')
        await this.readPixels()
        await this.readSuffix()
        if (this.currentIndex !== this.inputBuffer.length)
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
