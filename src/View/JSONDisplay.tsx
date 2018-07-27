import React from 'react'
import Component from './Component'
import Rjv from 'react-json-view'

let JSONDisplay = Component<{ json: object | string }>(function JSONDisplay (props) {
    let json = (typeof props.json === 'string') ? JSON.parse(props.json) : props.json
    return <Rjv src={json} />
})

let BTFMetadataDisplay = Component(function BTFMetadata (props) {
    return <div>
        <h3>Metadata</h3>
        <JSONDisplay json={props.appState.btf().generateManifest()} />
    </div>
})

export default JSONDisplay
export { JSONDisplay, BTFMetadataDisplay }
