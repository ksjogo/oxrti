import JSZip from 'jszip'
export type BTFCache = { [key: string]: BTFFile }
export type Channels = { [key: string]: Channel }
export type Channel = { [key: string]: Coefficent }
export type Coefficent = {
    data: Blob,
    fileformat: string,
}

export type TexForRender = {
    type: 'oxrti',
    data: Blob,
    width: number,
    height: number,
    ident: string,
}

function JSONY (thing) {
    return JSON.stringify(thing, null, 2)
}

export default class BTFFile {
    oxrtiState: object = {}
    width: number = 0
    height: number = 0
    name: string = ''
    formatMetadata: object = {}
    format: 'LRGBPTM' = 'LRGBPTM'

    channels: Channels

    constructor (manifest: any) {
        this.name = manifest.name
        this.format = manifest.format
        this.width = manifest.width
        this.height = manifest.height
        this.formatMetadata = manifest.formatMetadata
        this.channels = manifest.data
    }

    generateManifest () {
        return JSONY({
            name: this.name,
            format: this.format,
            width: this.width,
            height: this.height,
            formatMetadata: this.formatMetadata,
            data: this.formatChannels(),
        })
    }

    formatChannels () {
        return this.channels
    }

    async generateZip () {
        let zip = new JSZip()

        let dataFolder = zip.folder('data')
        for (const channelName in this.channels) {
            let channelFolder = dataFolder.folder(channelName)
            for (const coefficentName in this.channels[channelName]) {
                let coefficent = this.channels[channelName][coefficentName]
                channelFolder.file(`${coefficentName}.${coefficent.fileformat}`, coefficent.data)
            }
        }
        zip.file('manifest.json', this.generateManifest())
        zip.file('oxrti.json', JSONY(this.oxrtiState))
        return zip.generateAsync({ type: 'blob' })
    }

    texForRender (channel: string, coefficent: string): TexForRender {
        let co = this.channels[channel][coefficent]
        // return 'data:image/png;base64,' + co.data.toString('base64')
        return {
            data: co.data,
            width: this.width,
            height: this.height,
            type: 'oxrti',
            ident: this.name + channel + coefficent,
        }
    }

    aspectRatio () {
        return this.width / this.height
    }
}

export async function fromZip (data) {
    let archive = await JSZip.loadAsync(data)
    let dataFolder = archive.folder('data')
    let manifest = JSON.parse(await archive.file('manifest.json').async('text'))
    for (const channelName in manifest.data) {
        let channelFolder = dataFolder.folder(channelName)
        for (const coefficentName in manifest.data[channelName]) {
            let coefficent = manifest.data[channelName][coefficentName]
            let data = await channelFolder.file(`${coefficentName}.${coefficent.fileformat}`).async('blob')
            coefficent.data = data
        }
    }
    let btf = new BTFFile(manifest)
    return btf
}
