export type WriterConfig = { width: number, height: number, data: Buffer, elementSize: number }

export default abstract class Writer {
    width = 0
    height = 0
    inputBuffer: Buffer
    inputElementSize: number
    constructor(config: WriterConfig) {
        this.inputBuffer = config.data
        this.width = config.width
        this.height = config.height
        this.inputElementSize = config.elementSize
    }

    abstract encode (): Blob
}
