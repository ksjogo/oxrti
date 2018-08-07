import { IAppState } from '../State/AppState'
import Component from './Component'
import React from 'react'
import FileSaver from 'file-saver'
import { FunctionHook } from '../Hook'

function download (appState: IAppState) {
    return async (e) => {
        appState.asyncHookForEach('PreDownload', async (hook: FunctionHook) => {
            hook.func()
        })

        let btf = appState.btf()
        let zip = await btf.generateZip()
        FileSaver.saveAs(zip, btf.zipName())
    }
}

export default Component(function DownloadBTF (props) {
    return <button onClick={download(props.appState)}>Download BTF</button>
})
