import Writer from './Writer'
import { PNG } from 'pngjs'

export default class PNGWriter extends Writer {
    encode () {
        let bitDepth: 8 | 16 = this.inputElementSize
        let options = {
            width: this.width,
            height: this.height,
            colorType: 0 as 0,
            bitDepth: bitDepth,
            inputColorType: 0 as 0,
        }
        let img = new PNG(options)
        img.data = this.inputBuffer
        let buffer = PNG.sync.write(img, options)
        return new Blob([buffer], { type: 'image/png' })
    }
}
