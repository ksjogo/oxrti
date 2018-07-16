// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { IAppState } from '../../State/AppState'
// oxrti default imports ->

import shader from './zoom.glsl'

const ZoomModel = Plugin.props({
    title: 'Zoom',
})

class ZoomController extends shim(ZoomModel, Plugin) {

    prepareHooks (appState: IAppState) {
        super.prepareHooks(appState)
        appState.renderStack.insert('Zoom:Zoom', 10)
    }

    components () {
        return {
            'Zoom': ZoomComponent,
        }
    }
}

const { Plugin: TestPlugin, Component } = PluginCreator(ZoomController, ZoomModel, 'ZoomPlugin')
export default TestPlugin

const ZoomComponent = Component((plugin, props) => {
    return <ShaderNode
        shader={{
            frag: shader,
        }}
        uniforms={{
            children: props.children,
        }} />
})
