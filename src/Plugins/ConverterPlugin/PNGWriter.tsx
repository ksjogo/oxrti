import Writer from './Writer'
import { PNG, ColorType } from 'pngjs'

export default class PNGWriter extends Writer {
    encode () {
        let colorType: ColorType = 0
        switch (this.inputElementSize) {
            case 8:
                break
            case 24:
                colorType = 2
        }
        let options = {
            width: this.width,
            height: this.height,
            colorType: colorType,
            bitDepth: 8 as 8 | 16,
            inputColorType: colorType,
        }
        let img = new PNG(options)
        img.data = this.inputBuffer
        let buffer = PNG.sync.write(img, options)
        return new Blob([buffer], { type: 'image/png' })
    }
}
