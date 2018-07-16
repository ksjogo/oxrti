// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { IAppState } from '../../State/AppState'
// oxrti default imports ->

import shader from './rotation.glsl'

const RotationModel = Plugin.props({
    title: 'Rotation',
})

class RotationController extends shim(RotationModel, Plugin) {

    prepareHooks (appState: IAppState) {
        appState.renderStack.insert('Rotation:Rotation', 20)
    }

    components () {
        return {
            'Rotation': RotationComponent,
        }
    }
}

const { Plugin: RotationPlugin, Component } = PluginCreator(RotationController, RotationModel, 'RotationPlugin')
export default RotationPlugin

const RotationComponent = Component((plugin, props) => {
    return <ShaderNode
        shader={{
            frag: shader,
        }}
        uniforms={{
            children: props.children,
        }} />
})
