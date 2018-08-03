export default abstract class Writer {
    width = 0
    height = 0
    inputBuffer: Buffer
    inputElementSize: number
    constructor (config: { width: number, height: number, data: Buffer, elementSize: number }) {
        this.inputBuffer = config.data
        this.width = config.width
        this.height = config.height
        this.inputElementSize = config.elementSize
    }

    abstract encode (): Blob
}
