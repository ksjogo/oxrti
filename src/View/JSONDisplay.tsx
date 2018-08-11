import React from 'react'
import Component from './Component'
import Rjv from 'react-json-view'
import { Theme, createStyles, Divider, Paper, Drawer, Card, CardContent, CardActions, List, ListItem } from '@material-ui/core'

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
    if (!props.appState.btf().isDefault())
        return <JSONDisplay
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
    else
        return <div />
})

let BTFMetadataConciseDisplay = Component(function BTFMetadata (props) {
    if (!props.appState.btf().isDefault())
        return < Card style={{ width: '100%' }}>
            <CardContent>
                <JSONDisplay
                    json={props.appState.btf().conciseManifest()}
                    style={{
                        'fontFamily': 'monospace',
                        'cursor': 'default',
                        'backgroundColor': 'rgba(0, 0, 0, 0)',
                        'position': 'relative',
                        'padding': '10px',
                        'borderRadius': '3px',
                        'margin': '10px 0px',
                    }} />
            </CardContent>
        </Card>
    else
        return null
})

export default JSONDisplay
export { JSONDisplay, BTFMetadataDisplay, BTFMetadataConciseDisplay }
