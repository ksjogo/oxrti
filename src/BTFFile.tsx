import JSZip from 'jszip'

function JSONY (thing: object) {
    return JSON.stringify(thing, null, 2)
}

const DummyRenderSize = 300

export type BTFCache = { [key: string]: BTFFile }

export type ChannelModel = 'RGB' | 'LRGB' | 'SPECTRAL'
export type CoefficentModel = 'RTIpoly6' | 'flat'
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
    id: string,
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

let IDC = 0
/** %beginBTF */
export default class BTFFile {
    /** running id numbers to allow easy cache busts */
    id: number
    /** JSON object of the included oxrti state */
    oxrtiState: object = {}
    /** default data representation */
    data: Data = {
        width: DummyRenderSize,
        height: DummyRenderSize,
        channelModel: null,
        channels: {},
        formatExtra: {},
    }
    /** reference to annotation layers */
    layers: AnnotationLayer[] = []
    /** user visible name */
    name: string = ''
    /** manifest can come from an unpacked zip, usully typed as any */
    constructor (manifest?: BTFFile) {
        if (!manifest)
            return

        this.id = IDC++
        this.name = manifest.name
        this.data = manifest.data
        this.layers = manifest.layers
        this.oxrtiState = manifest.oxrtiState
    }
    /** cannocical zip name for name and id */
    zipName () {
        return `${this.name || 'noise'}.btf.zip`
    }

    /** return true if no data is contained/is dummy object */
    isDefault () {
        return this.name === ''
    }

    /** export the JSON data of the manifest.json file */
    generateManifest () {
        let manifest = {
            name: this.name,
            data: this.data,
        }
        return JSONY(manifest)
    }
    /** export user visible shortened metadata */
    conciseManifest () {
        return JSONY({
            name: this.name,
            format: this.data.channelModel,
            width: this.data.width,
            height: this.data.height,
        })
    }

    /**
     * Generate a unique tex container which the gl-react loader will cache
     * @param channel reference to the named channel
     * @param coefficent reference to the named child coefficent of channel
     */
    texForRender (channel: string, coefficent: string): TexForRender {
        let co = this.data.channels[channel].coefficents[coefficent]
        return {
            data: co.data,
            width: this.data.width,
            height: this.data.height,
            type: 'oxrti',
            ident: this.name + channel + coefficent,
            format: co.format,
        }
    }

    /**
     * Generate a tex configuration for a layer
     * @param id of the layer, must be found in this.layers
     */
    annotationTexForRender (id: string): TexForRender {
        let layer = this.layers.find(layer => layer.id === id)
        if (!layer)
            return null
        return {
            data: layer.texture,
            width: this.data.width,
            height: this.data.height,
            type: 'oxrti',
            ident: id,
            format: 'PNG32',
        }
    }

    /** aspect ratio of the contained data */
    aspectRatio () {
        return this.data.width / this.data.height
    }

    /** package the current data into a zip blob */
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

/** unpackage a zip blob into a BTFFile */
export async function fromZip (zipData: Blob | ArrayBuffer) {
    let archive = await JSZip.loadAsync(zipData)
    let dataFolder = archive.folder('data')
    let manifest = JSON.parse(await archive.file('manifest.json').async('text')) as BTFFile
    let data = manifest.data
    for (const channelName in data.channels) {
        let channelFolder = dataFolder.folder(channelName)
        for (const coefficentName in data.channels[channelName].coefficents) {
            let coefficent = data.channels[channelName].coefficents[coefficentName]
            let fileformat = coefficent.format.toLowerCase().substring(0, 3)
            let imageData = await channelFolder.file(`${coefficentName}.${fileformat}`).async('arraybuffer')
            coefficent.data = new Blob([imageData], { type: 'image/png' })
        }
    }

    let layersFile = archive.file('oxrti_layers.json')
    if (layersFile) {
        let layersConfig = JSON.parse(await layersFile.async('text')) as AnnotationLayer[]
        let layerFolder = archive.folder('layers')
        for (const layer of layersConfig) {
            let layerData = await layerFolder.file(`${layer.name}.png`).async('arraybuffer')
            layer.texture = new Blob([layerData], { type: 'image/png' })
        }
        manifest.layers = layersConfig
    } else {
        manifest.layers = []
    }

    let stateFile = archive.file('oxrti_state.json')
    if (stateFile) {
        let stateConfig = JSON.parse(await stateFile.async('text')) as object
        manifest.oxrtiState = stateConfig
    } else {
        manifest.oxrtiState = {}
    }

    let btf = new BTFFile(manifest)
    return btf
}
/** %endBTF */
