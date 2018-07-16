// <- oxrti default imports
import React from 'react'
import Plugin, { PluginCreator, shim, action, ShaderNode } from '../../Plugin'
import { IAppState } from '../../State/AppState'
// oxrti default imports ->

import Slider from '@material-ui/lab/Slider'
import shader from './zoom.glsl'
import Typography from '@material-ui/core/Typography'

const ZoomModel = Plugin.props({
    title: 'Zoom',
    scale: 1,
})

class ZoomController extends shim(ZoomModel, Plugin) {

    prepareHooks (appState: IAppState) {
        super.prepareHooks(appState)
        appState.renderStack.insert('Zoom:Zoom', 20)
        appState.addViewerSideHook('Zoom:Slider')
    }

    components () {
        return {
            Zoom: ZoomComponent,
            Slider: SliderComponent,
        }
    }

    @action
    onSlider (event, value) {
        this.scale = value
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
            scale: 1 / plugin.scale,
        }} />
})

const SliderComponent = Component((plugin, props) => {
    return <div>
        <Typography>Zoom</Typography>
        <Slider value={plugin.scale} onChange={plugin.onSlider} min={1} max={10} />
    </div>
})
