import ConverterStrategy from '../ConverterPlugin/ConverterStrategy'
import { sleep } from '../../util'
import _ from 'lodash'
import bmp from 'bmp-js'
import JSZip from 'jszip'
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

    async process () {
        await this.ui.setProgress(0)
        await this.ui.setMessage('Parsing metadata.')

        let prefix = this.readTillNewLine()
        if (prefix !== PREFIX)
            return Promise.reject(`Prefix ${prefix} is not supported, only ${PREFIX} is!`)

        let format = this.readTillNewLine()
        if (format !== FORMAT)
            return Promise.reject(`Prefix ${format} is not supported, only ${FORMAT} is currently!`)

        let widthAndHeight = this.readTillNewLine()
        let width = 0
        let height = 0
        let split = widthAndHeight.split(' ')
        width = parseInt(split[0], 10)
        if (split.length === 2)
            height = parseInt(split[1], 10)
        else
            height = parseInt(this.readTillNewLine(), 10)

        let scales = this.readTillNewLine().split(' ')
        let biases
        if (scales.length === 12) { // new line before bias
            biases = scales.slice(6, 13)
        } else {
            biases = this.readTillNewLine().split(' ').slice(0, 6)
        }
        scales = scales.slice(0, 6)

        let scalesF = scales.map(val => parseFloat(val))
        let biasesF = biases.map(val => parseFloat(val))

        await this.ui.setMessage('Reading pixels.')

        const pixels = height * width
        /**
         * a_0, a_1, a_2, a_3, a_4, a_5, a_6, R, G, B
         */
        const coeffs = ['a_0', 'a_1', 'a_2', 'a_3', 'a_4', 'a_5', 'R', 'G', 'B']
        let data = _.range(0, 9).map(() => new Uint8Array(pixels))
        for (let pix = 0; pix < pixels; pix++) {
            for (let co = 0; co < data.length; co++)
                data[co][pix] = this.readOne()
            if (pix % (pixels / 100) === 0) {
                await this.ui.setProgress((pix / pixels * 100) + 1)
                await sleep(1)
            }
        }

        if (this.currentIndex !== this.view.length)
            throw new Error('we missed some data!')

        await this.ui.setMessage('Generating zip.')
        await this.ui.setProgress(0)

        let zip = new JSZip()

        for (let i = 0; i < data.length; i++) {
            let bmpData = {
                data: data[i],
                width: width,
                height: height,
            }

            let bmpfile = new BmpEncoder(bmpData).encode()
            await zip.file(`${coeffs[i]}.bmp`, bmpfile)
            await this.ui.setProgress(((i + 1) / data.length) * 100)
        }

        await this.ui.setMessage('Zip generated.')
        return zip.generateAsync({ type: 'blob' })
    }
}
