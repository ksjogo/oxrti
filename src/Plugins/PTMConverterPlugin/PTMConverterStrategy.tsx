import ConverterStrategy from '../ConverterPlugin/ConverterStrategy'
import { range } from 'lodash'
import BmpEncoder from '../ConverterPlugin/BPMWriter'

const PREFIX = 'PTM_1.2'
const FORMAT = 'PTM_FORMAT_LRGB'
/**
 * Implementing PTM Converting according to http://www.hpl.hp.com/research/ptm/downloads/PtmFormat12.pdf
 */
export default class PTMConverterStrategy extends ConverterStrategy {
    createView () {
        return new Uint8Array(this.content)
    }

    scales: number[]
    biases: number[]

    async parseMetadata () {
        let prefix = this.readTillNewLine()
        if (prefix !== PREFIX)
            return Promise.reject(`Prefix ${prefix} is not supported, only ${PREFIX} is!`)

        let format = this.readTillNewLine()
        if (format !== FORMAT)
            return Promise.reject(`Prefix ${format} is not supported, only ${FORMAT} is currently!`)

        let widthAndHeight = this.readTillNewLine()
        let split = widthAndHeight.split(' ')
        this.width = parseInt(split[0], 10)
        if (split.length === 2)
            this.height = parseInt(split[1], 10)
        else
            this.height = parseInt(this.readTillNewLine(), 10)

        let scales = this.readTillNewLine().split(' ')
        let biases
        if (scales.length === 12) { // new line before bias
            biases = scales.slice(6, 13)
        } else {
            biases = this.readTillNewLine().split(' ').slice(0, 6)
        }
        scales = scales.slice(0, 6)

        this.scales = scales.map(val => parseFloat(val))
        this.biases = biases.map(val => parseFloat(val))
    }

    data: Uint8Array[]
    coeffs = ['a_0', 'a_1', 'a_2', 'a_3', 'a_4', 'a_5', 'R', 'G', 'B']

    async readPixels () {

        /**
         * a_0, a_1, a_2, a_3, a_4, a_5, a_6, R, G, B
         */
        this.data = range(0, 9).map(() => new Uint8Array(this.pixels))
        for (let pix = 0; pix < this.pixels; pix++) {
            for (let co = 0; co < this.data.length; co++)
                this.data[co][pix] = this.readOne()
            if (pix % (this.pixels / 100) === 0) {
                await this.ui.setProgress(pix / this.pixels * 100 + 1)
            }
        }
    }

    async readSuffix () {
        //
    }

    async fillZip (zip) {
        for (let i = 0; i < this.data.length; i++) {
            let bmpData = {
                data: this.data[i],
                width: this.width,
                height: this.height,
            }

            let bmpfile = new BmpEncoder(bmpData).encode()
            await zip.file(`${this.coeffs[i]}.bmp`, bmpfile)
            await this.ui.setProgress(((i + 1) / this.data.length) * 100)
        }
    }
}
