import IConverterUI from './ConverterUI'
import { typeCheckSuccess } from 'mobx-state-tree/dist/internal'

export default abstract class ConverterStrategy {
    view: Uint8Array | Int8Array = null
    content: ArrayBuffer = null
    ui: IConverterUI

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

    readOne () {
        if (this.currentIndex >= this.view.length) {
            debugger
            throw new Error('Reached end of file prematurely!')
        }
        return this.view[this.currentIndex++]
    }

    abstract async process (): Promise<string | number[] | Uint8Array | ArrayBuffer | Blob | Buffer>

}
