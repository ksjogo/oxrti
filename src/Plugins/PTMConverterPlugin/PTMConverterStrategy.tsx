import ConverterStrategy from '../ConverterPlugin/ConverterStrategy'
import PNGWriter from '../ConverterPlugin/PNGWriter'
import { Channels } from '../../BTFFile'

export type PTMFormatMetadata = {
    biases: number[],
    scales: number[],
}

const PREFIX = 'PTM_1.2'
const FORMATS = ['PTM_FORMAT_LRGB', 'PTM_FORMAT_RGB']
/**
 * Implementing PTM Converting according to http://www.hpl.hp.com/research/ptm/downloads/PtmFormat12.pdf
 */
export default class PTMConverterStrategy extends ConverterStrategy {

    formatMetadata: PTMFormatMetadata

    async parseMetadata () {
        let prefix = this.readTillNewLine()
        if (prefix !== PREFIX)
            return Promise.reject(`Prefix ${prefix} is not supported, only ${PREFIX} is!`)

        let format = this.readTillNewLine()
        if (FORMATS.indexOf(format) === -1)
            return Promise.reject(`Prefix ${format} is not supported, only ${FORMATS} are currently!`)

        if (format === FORMATS[0])
            this.channelModel = 'LRGB'
        else
            this.channelModel = 'RGB'

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

        return Promise.resolve()
    }

    coeffData: Buffer[]
    coeffNames: string[] = null

    async readPixels () {
        if (this.channelModel === 'LRGB') {
            this.coeffNames = ['a_0', 'a_1', 'a_2', 'a_3', 'a_4', 'a_5', 'R', 'G', 'B']
            return this.readPixelsLRGB()
        } else {
            this.coeffNames = ['R0R1R2', 'R3R4R5', 'G0G1G2', 'G3G4G5', 'B0B1B2', 'B3B4B5']
            return this.readPixelsRGB()
        }
    }

    /** %beginRead */
    async readPixelsLRGB () {
        // allocate output buffers for ['a_0', 'a_1', 'a_2', 'a_3', 'a_4', 'a_5', 'R', 'G', 'B']
        this.coeffData = this.coeffNames.map(e => Buffer.alloc(this.pixels))
        // this.pixelData contains pixels * [a_0, a_1, a_2, a_3, a_4, a_5] and then pixels * [R, G, B]
        for (let y = 0; y < this.height; ++y)
            for (let x = 0; x < this.width; ++x) {
                // iterate over pixels
                let originalIndex = ((y * this.width) + x)
                // flip the Y index, as PTM is bottom-row first, whereas BTF is top-row first
                let targetIndex = ((this.height - 1 - y) * this.width) + x
                // read from the coefficent block
                for (let i = 0; i <= 5; i++)
                    this.coeffData[i][targetIndex] = this.pixelData[originalIndex * 6 + i]
                // read from RGB block by skipping over the coefficent block and then iterating colors
                for (let i = 0; i <= 2; i++)
                    this.coeffData[i + 6][targetIndex] = this.pixelData[this.pixels * 6 + originalIndex * 3 + i]
                // update the progress bar
                if (originalIndex % (this.pixels / 100) === 0) {
                    await this.ui.setProgress(originalIndex / this.pixels * 100 + 1)
                }
            }
    }

    async readPixelsRGB () {
        // allocate output buffers for ['R0R1R2', 'R3R4R5', 'G0G1G2', 'G3G4G5', 'B0B1B2', 'B3B4B5']
        this.coeffData = this.coeffNames.map(e => Buffer.alloc(this.pixels * 3))
        // this.pixelData contains a block of  pixels * [a_0, a_1, a_2, a_3, a_4, a_5] for each color
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                for (let color = 0; color <= 2; color++) {
                    // iterate over pixels and colors
                    let inputIndex = (((y * this.width) + x) + this.pixels * color) * 6
                    // flip the Y index, as PTM is bottom-row first, whereas BTF is top-row first
                    let targetIndex = (((this.height - 1 - y) * this.width) + x) * 3
                    // iterate over the coefficents for the given pixel/inputIndex */
                    for (let i = 0; i <= 5; i++) {
                        let bucket = color * 2 + Math.floor(i / 3)
                        this.coeffData[bucket][targetIndex + (i % 3)] = this.pixelData[inputIndex + i]
                    }
                }
            }
            // update the progress bar
            if (y % (this.height / 100) === 0) {
                await this.ui.setProgress(y / this.height * 100 + 1)
            }
        }
    }
    /** %endRead */

    async readSuffix () {
        //
    }

    bmps: Blob[] = []
    async bundleChannels () {
        if (this.channelModel === 'LRGB') {
            return this.bundleChannelsLRGB()
        } else {
            return this.bundleChannelsRGB()
        }
    }

    async bundleChannelsRGB () {
        for (let i = 0; i < this.coeffData.length; i++) {
            let bmpData = {
                data: this.coeffData[i],
                width: this.width,
                height: this.height,
                elementSize: 24,
            }
            this.bmps.push(new PNGWriter(bmpData).encode())
            await this.ui.setProgress(((i + 1) / this.coeffData.length) * 100)
        }
        let channels: Channels = {
            R: {
                coefficentModel: 'RTIpoly6',
                coefficents: {
                    a0a1a2: {
                        data: this.bmps[0],
                        format: 'PNG24',
                    },
                    a3a4a5: {
                        data: this.bmps[1],
                        format: 'PNG24',
                    },
                },
            },
            G: {
                coefficentModel: 'RTIpoly6',
                coefficents: {
                    a0a1a2: {
                        data: this.bmps[2],
                        format: 'PNG24',
                    },
                    a3a4a5: {
                        data: this.bmps[3],
                        format: 'PNG24',
                    },
                },
            },
            B: {
                coefficentModel: 'RTIpoly6',
                coefficents: {
                    a0a1a2: {
                        data: this.bmps[4],
                        format: 'PNG24',
                    },
                    a3a4a5: {
                        data: this.bmps[5],
                        format: 'PNG24',
                    },
                },
            },
        }
        return Promise.resolve(channels)
    }

    async bundleChannelsLRGB () {
        for (let i = 0; i < this.coeffData.length; i++) {
            let bmpData = {
                data: this.coeffData[i],
                width: this.width,
                height: this.height,
                elementSize: 8 as 8 | 16,
            }
            this.bmps.push(new PNGWriter(bmpData).encode())
            await this.ui.setProgress(((i + 1) / this.coeffData.length) * 100)
        }
        let channels: Channels = {
            L: {
                coefficentModel: 'RTIpoly6',
                coefficents: {
                    a0: {
                        data: this.bmps[0],
                        format: 'PNG8',
                    },
                    a1: {
                        data: this.bmps[1],
                        format: 'PNG8',
                    },
                    a2: {
                        data: this.bmps[2],
                        format: 'PNG8',
                    },
                    a3: {
                        data: this.bmps[3],
                        format: 'PNG8',
                    },
                    a4: {
                        data: this.bmps[4],
                        format: 'PNG8',
                    },
                    a5: {
                        data: this.bmps[5],
                        format: 'PNG8',
                    },
                },
            },
            R: {
                coefficentModel: 'flat',
                coefficents: {
                    a0: {
                        data: this.bmps[6],
                        format: 'PNG8',
                    },
                },
            },
            G: {
                coefficentModel: 'flat',
                coefficents: {
                    a0: {
                        data: this.bmps[7],
                        format: 'PNG8',
                    },
                },
            },
            B: {
                coefficentModel: 'flat',
                coefficents: {
                    a0: {
                        data: this.bmps[8],
                        format: 'PNG8',
                    },
                },
            },
        }
        return Promise.resolve(channels)
    }
}
