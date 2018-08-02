import ConverterStrategy from '../ConverterPlugin/ConverterStrategy'
import PNGWriter from '../ConverterPlugin/PNGWriter'
import { Channels } from '../../BTFFile'

export type PTMFormatMetadata = {
    biases: number[],
    scales: number[],
}

const PREFIX = 'PTM_1.2'
const FORMAT = 'PTM_FORMAT_LRGB'
/**
 * Implementing PTM Converting according to http://www.hpl.hp.com/research/ptm/downloads/PtmFormat12.pdf
 */
export default class PTMConverterStrategy extends ConverterStrategy {

    format = FORMAT
    formatMetadata: PTMFormatMetadata

    async parseMetadata () {
        let prefix = this.readTillNewLine()
        if (prefix !== PREFIX)
            return Promise.reject(`Prefix ${prefix} is not supported, only ${PREFIX} is!`)

        let format = this.readTillNewLine()
        if (format !== FORMAT)
            return Promise.reject(`Prefix ${format} is not supported, only ${FORMAT} is currently!`)

        this.channelModel = 'LRGB'
        let widthAndHeight = this.readTillNewLine()
        let split = widthAndHeight.split(' ')
        this.width = parseInt(split[0], 10)
        if (split.length === 2)
            this.height = parseInt(split[1], 10)
        else
            this.height = parseInt(this.readTillNewLine(), 10)

        let scales = this.readTillNewLine().split(' ')
        let biases: string[]
        if (scales.length === 12) { // new line before bias
            biases = scales.slice(6, 13)
        } else {
            biases = this.readTillNewLine().split(' ').slice(0, 6)
        }
        scales = scales.slice(0, 6)

        this.formatMetadata = {
            scales: scales.map(val => parseFloat(val)),
            biases: biases.map(val => parseFloat(val)),
        }
    }

    coeffNames = ['a_0', 'a_1', 'a_2', 'a_3', 'a_4', 'a_5', 'R', 'G', 'B']
    coeffData: Buffer[]
    async readPixels () {
        /**
         * The block contains of
         * pixels times [a_0, a_1, a_2, a_3, a_4, a_5]
         * and then
         *  pixels times [R, G, B]
         */
        this.coeffData = this.coeffNames.map(e => Buffer.alloc(this.pixels))
        // orientated at http://www.tobias-franke.eu/projects/ptm/
        // and https://github.com/alexbrey/ptmconvert/blob/master/hg/src/ptmconvert.cpp
        for (let y = 0; y < this.height; ++y)
            for (let x = 0; x < this.width; ++x) {
                let p = ((y * this.width) + x)
                let index = p // * 3

                for (let i = 0; i <= 5; i++)
                    this.coeffData[i][index] = this.pixelData[p * 6 + i]

                for (let i = 0; i <= 2; i++)
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
        let bmps: Blob[] = []
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
                coefficentModel: 'LRGB',
                coefficents: {
                    a0: {
                        data: bmps[0],
                        format: 'PNG8',
                    },
                    a1: {
                        data: bmps[1],
                        format: 'PNG8',
                    },
                    a2: {
                        data: bmps[2],
                        format: 'PNG8',
                    },
                    a3: {
                        data: bmps[3],
                        format: 'PNG8',
                    },
                    a4: {
                        data: bmps[4],
                        format: 'PNG8',
                    },
                    a5: {
                        data: bmps[5],
                        format: 'PNG8',
                    },
                },
            },
            R: {
                coefficentModel: 'LRGB',
                coefficents: {
                    a0: {
                        data: bmps[6],
                        format: 'PNG8',
                    },
                },
            },
            G: {
                coefficentModel: 'LRGB',
                coefficents: {
                    a0: {
                        data: bmps[7],
                        format: 'PNG8',
                    },
                },
            },
            B: {
                coefficentModel: 'LRGB',
                coefficents: {
                    a0: {
                        data: bmps[8],
                        format: 'PNG8',
                    },
                },
            },
        }
        return Promise.resolve(channels)
    }
}
