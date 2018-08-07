import JSZip from 'jszip'
import { DummyRenderSize } from './Math'
export type BTFCache = { [key: string]: BTFFile }

export type ChannelModel = 'RGB' | 'LRGB' | 'SPECTRAL'
export type CoefficentModel = 'flat' | string
export type FileFormat = 'BMP8' | 'BMP16' | 'BMP24' | 'BMP32' | 'PNG8' | 'PNG16' | 'PNG24' | 'PNG32' | 'PNG42' | 'PNG64'
export type Channels = { [key: string]: Channel }
export type Channel = {
    coefficents: { [key: string]: Coefficent },
    coefficentModel: CoefficentModel,
}
export type Coefficent = {
    data: Blob,
    format: FileFormat,
}

export type Data = {
    width: number,
    height: number,
    channelModel: ChannelModel,
    channels: Channels,
    formatExtra: any,
}

export type AnnotationLayer = {
    name: string,
    texture: Blob,
}

export type TexForRender = {
    type: 'oxrti',
    data: Blob,
    width: number,
    height: number,
    ident: string,
    format: FileFormat,
}

function JSONY (thing) {
    return JSON.stringify(thing, null, 2)
}

let IDC = 0

export default class BTFFile {
    id: number
    oxrtiState: object = {}
    data: Data = {
        width: DummyRenderSize,
        height: DummyRenderSize,
        channelModel: null,
        channels: {},
        formatExtra: {},
    }

    layers: AnnotationLayer[] = []
    name: string = ''

    constructor (manifest?: any) {
        if (!manifest)
            return

        this.id = IDC++
        this.name = manifest.name
        this.data = manifest.data
        this.layers = manifest.layers
    }

    zipName () {
        return `${this.name || 'noise'}.btf.zip`
    }

    isDefault () {
        return this.name === ''
    }

    generateManifest () {
        let manifest = {
            name: this.name,
            data: this.data,
        }
        manifest.data.channels = this.formatChannels(manifest.data.channels)
        return JSONY(manifest)
    }

    conciseManifest () {
        return JSONY({
            name: this.name,
            format: this.data.channelModel,
            width: this.data.width,
            height: this.data.height,
        })
    }

    formatChannels (channels: Channels) {
        return channels
    }

    /**
     * Generate a unique tex container which the gl-react loader will cache
     * @param channel
     * @param coefficent
     */
    texForRender (channel: string, coefficent: string): TexForRender {
        let co = this.data.channels[channel].coefficents[coefficent]
        return {
            data: co.data,
            width: this.data.width,
            height: this.data.height,
            type: 'oxrti',
            ident: this.name + channel + coefficent + this.id,
            format: co.format,
        }
    }

    annotationTexForRender (name: string): TexForRender {
        let layer = this.layers.find(layer => layer.name === name)
        if (!layer)
            return null
        return {
            data: layer.texture,
            width: this.data.width,
            height: this.data.height,
            type: 'oxrti',
            ident: this.name + name + this.id,
            format: 'PNG32',
        }
    }

    aspectRatio () {
        return this.data.width / this.data.height
    }

    async generateZip () {
        let zip = new JSZip()

        let dataFolder = zip.folder('data')
        for (const channelName in this.data.channels) {
            let channelFolder = dataFolder.folder(channelName)
            for (const coefficentName in this.data.channels[channelName].coefficents) {
                let coefficent = this.data.channels[channelName].coefficents[coefficentName]
                let fileformat = coefficent.format.toLowerCase().substring(0, 3)
                channelFolder.file(`${coefficentName}.${fileformat}`, coefficent.data)
            }
        }
        let layerFolder = zip.folder('layers')
        for (const layer of this.layers) {
            layerFolder.file(`${layer.name}.png`, layer.texture)
        }
        zip.file('manifest.json', this.generateManifest())
        zip.file('oxrti_state.json', JSONY(this.oxrtiState))
        zip.file('oxrti_layers.json', JSONY(this.layers))
        return zip.generateAsync({ type: 'blob' })
    }
}

export async function fromZip (zipData) {
    let archive = await JSZip.loadAsync(zipData)
    let dataFolder = archive.folder('data')
    let manifest = JSON.parse(await archive.file('manifest.json').async('text')) as BTFFile
    let data = manifest.data
    for (const channelName in data.channels) {
        let channelFolder = dataFolder.folder(channelName)
        for (const coefficentName in data.channels[channelName].coefficents) {
            let coefficent = data.channels[channelName].coefficents[coefficentName]
            let fileformat = coefficent.format.toLowerCase().substring(0, 3)
            let imageData = await channelFolder.file(`${coefficentName}.${fileformat}`).async('blob')
            coefficent.data = imageData
        }
    }

    let layersConfig = JSON.parse(await archive.file('oxrti_layers.json').async('text')) as AnnotationLayer[]
    let layerFolder = archive.folder('layers')
    for (const layer of layersConfig) {
        let layerData = await layerFolder.file(`${layer.name}.png`).async('blob')
        layer.texture = layerData
    }
    manifest.layers = layersConfig

    let btf = new BTFFile(manifest)
    return btf
}
