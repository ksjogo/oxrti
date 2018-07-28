import React from 'react'
import { ComponentProps } from '../../View/Component'
import { IWrappedComponent } from 'mobx-react'
import { IAppState } from '../../State/AppState'
import { ILightControlPlugin } from '../LightControlPlugin/LightControlPlugin'
import hemispherical from '../LightControlPlugin/Hemisphere'

export default abstract class BaseNode {
    appState: IAppState
    abstract render: React.StatelessComponent<ComponentProps> & IWrappedComponent<React.StatelessComponent<ComponentProps>>

    lightPos () {
        let plugin = this.appState.plugins.get('LightControlPlugin') as ILightControlPlugin
        if (!plugin)
            return hemispherical(0, 0)
        else
            return hemispherical(plugin.x, plugin.y)
    }
}
