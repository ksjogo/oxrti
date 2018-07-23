import IConverterUI from './ConverterUI'
import { typeCheckSuccess } from 'mobx-state-tree/dist/internal'
import JSZip from 'jszip'

export default abstract class ConverterStrategy {
    view: Uint8Array | Int8Array = null
    content: ArrayBuffer = null
    ui: IConverterUI

    width = 0
    height = 0

    get pixels () {
        return this.width * this.height
    }

    constructor (content: ArrayBuffer, ui: IConverterUI) {
        this.ui = ui
        this.content = content
        this.view = this.createView()
    }

    abstract createView ()

    currentIndex = 0
    readTillNewLine () {
        let str = ''
        while (true) {
            if (this.currentIndex >= this.view.length)
                throw new Error('Reached end of file before newline')
            let next = String.fromCharCode(this.view[this.currentIndex++])
            if (next !== '\n')
                str += next
            else
                break
        }
        return str
    }

    readOne (progress = true) {
        if (this.currentIndex >= this.view.length) {
            debugger
            throw new Error('Reached end of file prematurely!')
        }

        return this.view[this.currentIndex++]
    }

    async process (): Promise<Blob> {
        await this.ui.setProgress(0)
        await this.ui.setMessage('Parsing metadata.')
        await this.parseMetadata()
        await this.ui.setMessage('Reading pixels.')
        await this.readPixels()
        await this.readSuffix()
        if (this.currentIndex !== this.view.length)
            throw new Error('we missed some data!')
        await this.ui.setMessage('Generating zip.')
        await this.ui.setProgress(0)
        let zip = new JSZip()
        await this.fillZip(zip)
        await this.ui.setMessage('Exporting zip.')
        let ret = await zip.generateAsync({ type: 'blob' })
        await this.ui.setMessage('')
        return Promise.resolve(ret)
    }

    abstract async parseMetadata ()
    abstract async readPixels ()
    abstract async readSuffix ()
    abstract async fillZip (zip: JSZip)
}
