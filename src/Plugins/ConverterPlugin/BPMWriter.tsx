/**
 * @author shaozilee
 * https://github.com/shaozilee/bmp-js
 * LICENSE: MIT
 *
 * BMP format encoder,encode 24bit BMP
 * Not support quality compression
 *
 */

export default class BmpEncoder {
    /******************header***********************/
    flag = 'BM'
    reserved = 0
    offset = 54
    fileSize = 0
    planes = 1
    compress = 0
    hr = 0
    vr = 0
    colors = 0
    importantColors = 0
    width = 0
    height = 0
    buffer: Uint8Array = null
    data = []
    headerInfoSize = 40
    extraBytes = 0
    rgbSize = 0
    pos = 0
    bitPP = 0

    COMPONENTS = 3

    constructor(imgData: { width: number, height, data: Uint8Array }) {
        this.buffer = imgData.data
        this.width = imgData.width
        this.height = imgData.height
        this.bitPP = this.COMPONENTS * 8

        this.extraBytes = this.width % 4
        this.rgbSize = this.height * (this.COMPONENTS * this.width + this.extraBytes)
        this.fileSize = this.rgbSize + this.offset
    }

    encode () {
        let tempBuffer = new Buffer(this.offset + this.rgbSize)
        this.pos = 0
        tempBuffer.write(this.flag, this.pos, 2); this.pos += 2
        tempBuffer.writeUInt32LE(this.fileSize, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.reserved, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.offset, this.pos); this.pos += 4

        tempBuffer.writeUInt32LE(this.headerInfoSize, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.width, this.pos); this.pos += 4
        tempBuffer.writeInt32LE(-this.height, this.pos); this.pos += 4
        tempBuffer.writeUInt16LE(this.planes, this.pos); this.pos += 2
        tempBuffer.writeUInt16LE(this.bitPP, this.pos); this.pos += 2
        tempBuffer.writeUInt32LE(this.compress, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.rgbSize, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.hr, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.vr, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.colors, this.pos); this.pos += 4
        tempBuffer.writeUInt32LE(this.importantColors, this.pos); this.pos += 4

        let i = 0
        let rowBytes = this.COMPONENTS * this.width + this.extraBytes

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let p = this.pos + y * rowBytes + x * this.COMPONENTS

                if (this.COMPONENTS === 3) {
                    i++// a
                    tempBuffer[p] = this.buffer[i++]// b
                    tempBuffer[p + 1] = this.buffer[i++]// g
                    tempBuffer[p + 2] = this.buffer[i++]
                } else {
                    tempBuffer.writeUInt8(this.buffer[i++], p)
                }

            }
            if (this.extraBytes > 0) {
                let fillOffset = this.pos + y * rowBytes + this.width * this.COMPONENTS
                tempBuffer.fill(0, fillOffset, fillOffset + this.extraBytes)
            }
        }

        return tempBuffer
    }
}
