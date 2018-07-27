import React from 'react'
import Component from './Component'
import Rjv from 'react-json-view'

let JSONDisplay = Component<{ json: object | string, style?: any }>(function JSONDisplay (props) {
    let json = (typeof props.json === 'string') ? JSON.parse(props.json) : props.json
    return <Rjv src={json}
        collapseStringsAfterLength={false}
        shouldCollapse={false}
        enableClipboard={false}
        displayObjectSize={false}
        displayDataTypes={false}
    />
})

let BTFMetadataDisplay = Component(function BTFMetadata (props) {
    if (props.appState.btf())
        return <div>
            <h3>Metadata</h3>
            <JSONDisplay
                json={props.appState.btf().generateManifest()}
                style={{
                    'fontFamily': 'monospace',
                    'cursor': 'default',
                    'backgroundColor': 'rgba(0, 0, 0, 0)',
                    'position': 'relative',
                    'padding': '10px',
                    'borderRadius': '3px',
                    'margin': '10px 0px',
                }} />

        </div>
    else
        return <div />
})

export default JSONDisplay
export { JSONDisplay, BTFMetadataDisplay }
