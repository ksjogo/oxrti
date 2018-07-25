import IConverterUI from './ConverterUI'
import BTFFile, { Channels } from '../../BTFFile'

export default abstract class ConverterStrategy {
    fileBuffer: ArrayBuffer
    inputBuffer: Buffer
    ui: IConverterUI
    pixelData: Buffer

    width = 0
    height = 0
    output: BTFFile

    get pixels () {
        return this.width * this.height
    }

    constructor (content: ArrayBuffer, ui: IConverterUI) {
        this.ui = ui
        this.fileBuffer = content
        this.inputBuffer = new Buffer(content)
        this.output = new BTFFile()
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

    async process (): Promise<BTFFile> {
        await this.ui.setProgress(0)
        await this.ui.setMessage('Parsing metadata.')
        await this.parseMetadata()
        this.output.width = this.width
        this.output.height = this.height
        await this.preparePixelData()
        await this.ui.setMessage('Reading pixels.')
        await this.readPixels()
        await this.readSuffix()
        if (this.currentIndex !== this.inputBuffer.length)
            throw new Error('we missed some data!')
        await this.ui.setMessage('Bundling channels.')
        await this.ui.setProgress(0)
        this.output.channels = await this.bundleChannels()
        return Promise.resolve(this.output)
    }

    abstract async parseMetadata ()
    abstract async readPixels ()
    abstract async readSuffix ()

    abstract async bundleChannels (): Promise<Channels>

}
