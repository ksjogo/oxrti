import { IAppState } from '../State/AppState'
import Component from './Component'
import React from 'react'
import FileSaver from 'file-saver'
import { AsyncFunctionHook } from '../Hook'

function download (appState: IAppState) {
    return async (e) => {
        await appState.asyncHookForEach('PreDownload', async (hook: AsyncFunctionHook) => {
            await hook.func()
        })

        let btf = appState.btf()
        let zip = await btf.generateZip()
        FileSaver.saveAs(zip, btf.zipName())
    }
}

export default Component(function DownloadBTF (props) {
    return <button onClick={download(props.appState)}>Download BTF</button>
})
