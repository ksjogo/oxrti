import React, { ReactText } from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import Rjv from 'react-json-view'
import { Tooltip as MTooltip, Theme, createStyles, Divider, Paper, Drawer, Card, CardContent, CardActions, List, ListItem } from '@material-ui/core'
import { HookNameComponent } from '../../Hook'

const BasePluginModel = Plugin.props({
})

class BasePluginController extends shim(BasePluginModel, Plugin) {
}

const { Plugin: BasePlugin, Component } = PluginCreator(BasePluginController, BasePluginModel, 'BasePlugin')
export default BasePlugin
export type IBasePlugin = typeof BasePlugin.Type

const JSONDisplay = Component<{ json: object | string, style?: any }>(function JSONDisplay (props) {
    let json = (typeof props.json === 'string') ? JSON.parse(props.json) : props.json
    return <Rjv src={json}
        collapseStringsAfterLength={false}
        shouldCollapse={false}
        enableClipboard={false}
        displayObjectSize={false}
        displayDataTypes={false}
    />
})

const BTFMetadataDisplay = Component(function BTFMetadataDisplay (props) {
    if (!this.appState.btf().isDefault())
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

const BTFMetadataConciseDisplay = Component(function BTFMetadataConciseDisplay (props) {
    if (!this.appState.btf().isDefault())
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

/**
 * Simple plugin rendering function
 * Will split on ':' and then look up the respective component from within the plugin tree
 */
const RenderHooks = Component<{ name: HookNameComponent }>(function RenderHooks (props) {
    let rendered = this.appState.hookMap(props.name, (hook, fullName) => {
        let Func = hook.component
        return <Func key={fullName} />
    })
    return <>{rendered}</>
})

const SafeGLIInspector = Component(function SafeGLIInspector (props) {
    let found = false
    let elems = document.getElementsByTagName('script')
    for (let i = 0; i < elems.length; i++)
        if (elems[i].innerText.indexOf('WebGLInspectorReadyEvent') !== -1)
            found = true

    if (found)
        return <></>
    else
        return <>{props.children}</>

})

const Tooltip: React.SFC<{
    title: string | number | ReactText | JSX.Element,
    key?: string | number,
}> = (props) => {
    return <div key={props.key}><MTooltip title={props.title}>
        {props.children as any}
    </MTooltip></div>
}

export { Tooltip, JSONDisplay, BTFMetadataDisplay, BTFMetadataConciseDisplay, RenderHooks, SafeGLIInspector }
