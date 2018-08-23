import IConverterUI from './ConverterUI'
import BTFFile, { Channels, ChannelModel } from '../../BTFFile'

/** %begin */
export default abstract class ConverterStrategy {
    /** raw file buffer */
    fileBuffer: ArrayBuffer
    /** wrapped file buffer */
    inputBuffer: Buffer
    /** UI delegate for status updates */
    ui: IConverterUI
    /** pixelData buffer, pointing into fileBuffer+metadata length */
    pixelData: Buffer

    /** extracted width and height */
    width = 0
    height = 0
    /** concrete BTF output */
    output: BTFFile
    /** freeform format depending JSON object, e.g. biases for PTMs */
    formatMetadata: object
    /** current channelModel as defined in the BTF specification */
    channelModel: ChannelModel = null
    /** total pixel count */
    get pixels () {
        return this.width * this.height
    }
    /** started from the converter ui */
    constructor (content: ArrayBuffer, ui: IConverterUI) {
        this.ui = ui
        this.fileBuffer = content
        this.inputBuffer = Buffer.from(content)
        this.output = new BTFFile()
    }

    /** pointer into the raw file buffer */
    currentIndex = 0
    /** read metadata till newline */
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

    /** read one item, usually byte */
    readOne () {
        if (this.currentIndex >= this.inputBuffer.length) {
            throw new Error('Reached end of file prematurely!')
        }

        return this.inputBuffer[this.currentIndex++]
    }

    /** prepare pixeldata buffer */
    async preparePixelData () {
        this.pixelData = Buffer.from(this.fileBuffer, this.currentIndex)
        this.currentIndex += this.fileBuffer.byteLength - this.currentIndex
    }

    /** run the actual conversion */
    async process (): Promise<BTFFile> {
        await this.ui.setProgress(0)
        await this.ui.setMessage('Parsing metadata.')
        await this.parseMetadata()
        this.output.data.channelModel = this.channelModel
        this.output.data.width = this.width
        this.output.data.height = this.height
        this.output.data.formatExtra = this.formatMetadata
        await this.preparePixelData()
        await this.ui.setMessage('Reading pixels.')
        await this.readPixels()
        await this.readSuffix()
        if (this.currentIndex !== this.inputBuffer.length)
            throw new Error('we missed some data!')
        await this.ui.setMessage('Bundling channels.')
        await this.ui.setProgress(0)
        this.output.data.channels = await this.bundleChannels()
        return Promise.resolve(this.output)
    }
    /** read the metadata block */
    abstract async parseMetadata (): Promise<void>
    /** read the pixel block */
    abstract async readPixels (): Promise<void>
    /** read potential suffix after pixel block */
    abstract async readSuffix (): Promise<void>
    /** bundle the read pixels into channels according to the channelModel */
    abstract async bundleChannels (): Promise<Channels>
}
/** %end */
