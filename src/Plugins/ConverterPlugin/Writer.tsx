export default abstract class Writer {
    width = 0
    height = 0
    inputBuffer: Buffer
    inputElementSize: 8 | 16
    constructor (config: { width: number, height: number, data: Buffer, elementSize: 8 | 16 }) {
        this.inputBuffer = config.data
        this.width = config.width
        this.height = config.height
        this.inputElementSize = config.elementSize
    }

    abstract encode (): Buffer
}
