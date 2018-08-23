import React, { ReactText } from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import Rjv from 'react-json-view'
import { Tooltip as MTooltip, Card, CardContent, Theme, createStyles } from '@material-ui/core'
import { ComponentHook, LimitedHook } from '../../Hook'
import { types, IModelType } from 'mobx-state-tree'
export type __IModelType = IModelType<any, any>
/** %begin */
const BasePluginModel = Plugin.props({
    greeting: 'In the beginning was the deed!',
})

class BasePluginController extends shim(BasePluginModel, Plugin) {
    @action
    onGreeting (event: any) {
        this.greeting += '!'
    }
}

// general plugin template code
const { Plugin: BasePlugin, Component } = PluginCreator(BasePluginController, BasePluginModel, 'BasePlugin')
export default BasePlugin
// export the type to allow other plugins to retrieve this plugin
export type IBasePlugin = typeof BasePlugin.Type

// CSS styles, classnames will be mangled, so styles is passed to the component
const styles = (theme: Theme) => createStyles({
    hello: {
        color: 'red',
    },
})

// props are standard react props, classes contains the mangled names
const HelloWorld = Component(function HelloWorld (props, classes) {
    return <p className={classes.hello} onClick={this.onGreeting}>{this.greeting}</p>
}, styles)
/** %end */

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
    if (!this.appState.btf().isDefault()) {
        let manifest = props.appState.btf().generateManifest()
        console.log(manifest)
        return <JSONDisplay
            json={manifest}
            style={{
                'fontFamily': 'monospace',
                'cursor': 'default',
                'backgroundColor': 'rgba(0, 0, 0, 0)',
                'position': 'relative',
                'padding': '10px',
                'borderRadius': '3px',
                'margin': '10px 0px',
            }} />
    } else {
        return <div />
    }
})

const BTFMetadataConciseDisplay = Component(function BTFMetadataConciseDisplay (props) {
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

/**
 * Simple plugin rendering function
 * Will split on ':' and then look up the respective component from within the plugin tree
 */
const RenderHooks = Component<{ name: LimitedHook<ComponentHook> }>(function RenderHooks (props) {
    let rendered = props.appState.hookMap(props.name, (hook, fullName) => {
        let Func = hook.component
        return <Func key={fullName} />
    })
    return <>{rendered}</>
})

/**
 * Wrap a gl-react surface so it will be disabled if the GLInspector chrome extension is present
 * The GLInspector can only handle one surface
 * It is most likely that the user wants to debug the main rendering surface, so all other surfaces should be wrapped.
 */
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
    className?: string,
}> = (props) => {
    return <MTooltip title={props.title || ''}>
        {props.children as any}
    </MTooltip>
}

export { Tooltip, JSONDisplay, BTFMetadataDisplay, BTFMetadataConciseDisplay, RenderHooks, SafeGLIInspector }
