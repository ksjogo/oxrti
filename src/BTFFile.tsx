import JSZip from 'jszip'
export type BTFCache = { [key: string]: BTFFile }
export type Channels = { [key: string]: Channel }
export type Channel = { [key: string]: Coefficent }
export type Coefficent = {
    data: Buffer,
    fileformat: string,
}

function JSONY (thing) {
    return JSON.stringify(thing, null, 2)
}

export default class BTFFile {
    oxrtiState: object = {}
    width: number = 0
    height: number = 0
    name: string = ''

    channels: Channels

    constructor () { }

    generateManifest () {
        return JSONY({
            data: null,
            width: this.width,
            height: this.height,
            name: this.name,
        })
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

    texUrl (co: Coefficent) {
        return 'data:image/png;base64,' + co.data.toString('base64')
    }

    aspectRatio () {
        return this.width / this.height
    }
}

export async function fromZip (data) {
    let archive = await JSZip.loadAsync(data)
    let manifest = archive.file('manifest.json')
    let state = archive.file('oxrti.json')

}
