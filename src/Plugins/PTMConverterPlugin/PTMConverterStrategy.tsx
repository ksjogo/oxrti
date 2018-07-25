import ConverterStrategy from '../ConverterPlugin/ConverterStrategy'
import PNGWriter from '../ConverterPlugin/PNGWriter'
import { Channels } from '../../BTFFile'

const PREFIX = 'PTM_1.2'
const FORMAT = 'PTM_FORMAT_LRGB'
/**
 * Implementing PTM Converting according to http://www.hpl.hp.com/research/ptm/downloads/PtmFormat12.pdf
 */
export default class PTMConverterStrategy extends ConverterStrategy {

    scales: number[]
    biases: number[]
    format = FORMAT

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

    coeffNames = ['a_0', 'a_1', 'a_2', 'a_3', 'a_4', 'a_5', 'R', 'G', 'B']
    coeffData: Buffer[]
    async readPixels () {
        /**
         * a_0, a_1, a_2, a_3, a_4, a_5, R, G, B
         */
        this.coeffData = this.coeffNames.map(e => Buffer.alloc(this.pixels))
        // orientated at http://www.tobias-franke.eu/projects/ptm/
        // and https://github.com/alexbrey/ptmconvert/blob/master/hg/src/ptmconvert.cpp
        for (let y = 0; y < this.height; ++y)
            for (let x = 0; x < this.width; ++x) {
                let p = ((y * this.width) + x)
                let index = p // * 3

                // flip image upside down if format LRGB
                // if (this.format === 'PTM_FORMAT_LRGB')
                index = (((this.height - 1 - y) * this.width) + x) // * 3

                // flip image horizontally if format JPEG
                // if (this.format === 'PTM_FORMAT_JPEG_LRGB')
                //    index = ((y * this.width) + (this.width - 1 - x)) * 3

                // coefficients: first wxhx6 block
                for (let i = 0; i <= 5; i++)
                    // coeffHdata[index + c] = ptm->coefficients[p * 6 + c]
                    // coeffLdata[index + c] = ptm->coefficients[p * 6 + c + 3]
                    this.coeffData[i][index] = this.pixelData[p * 6 + i]

                // rgb: second wxhx3 block
                for (let i = 0; i <= 2; i++)
                    // rgbdata[index + c] = ptm->coefficients[num_pixels * 6 + p * 3 + c]
                    this.coeffData[i + 6][index] = this.pixelData[this.pixels * 6 + p * 3 + i]

                if (p % (this.pixels / 100) === 0) {
                    await this.ui.setProgress(p / this.pixels * 100 + 1)
                }
            }
    }

    async readSuffix () {
        //
    }

    async bundleChannels () {
        let bmps = []
        for (let i = 0; i < this.coeffData.length; i++) {
            let bmpData = {
                data: this.coeffData[i],
                width: this.width,
                height: this.height,
                elementSize: 8 as 8 | 16,
            }
            bmps.push(new PNGWriter(bmpData).encode())
            await this.ui.setProgress(((i + 1) / this.coeffData.length) * 100)
        }
        let channels: Channels = {
            L: {
                a0: {
                    data: bmps[0],
                    fileformat: 'png',
                },
                a1: {
                    data: bmps[1],
                    fileformat: 'png',
                },
                a2: {
                    data: bmps[2],
                    fileformat: 'png',
                },
                a3: {
                    data: bmps[3],
                    fileformat: 'png',
                },
                a4: {
                    data: bmps[4],
                    fileformat: 'png',
                },
                a5: {
                    data: bmps[5],
                    fileformat: 'png',
                },
            },
            R: {
                R: {
                    data: bmps[6],
                    fileformat: 'png',
                },
            },
            G: {
                G: {
                    data: bmps[7],
                    fileformat: 'png',
                },
            },
            B: {
                B: {
                    data: bmps[8],
                    fileformat: 'png',
                },
            },
        }
        return Promise.resolve(channels)
    }
}
