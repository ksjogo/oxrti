import { IAppState } from '../State/AppState'
import Component from './Component'
import React from 'react'
import FileSaver from 'file-saver'
import { Button } from '@material-ui/core'

function download (appState: IAppState) {
    return async (e: any) => {
        appState.hookForEach('PreDownload')
        let btf = appState.btf()
        let zip = await btf.generateZip()
        FileSaver.saveAs(zip, btf.zipName())
    }
}

export default Component(function DownloadBTF (props) {
    return <Button onClick={download(props.appState)}>Save</Button>
})
