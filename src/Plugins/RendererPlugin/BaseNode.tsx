import React from 'react'
import { ComponentProps } from '../../View/Component'
import { IWrappedComponent } from 'mobx-react'
import { IAppState } from '../../State/AppState'
import { ILightControlPlugin } from '../LightControlPlugin/LightControlPlugin'
import hemispherical from '../LightControlPlugin/Hemisphere'
import { normalize } from '../../Math'

export type BaseExtraProps = {
    width?: number,
    height?: number,
    lightPos?: number[],
}

type BaseProps = ComponentProps & BaseExtraProps

export type BaseNodeRender = React.StatelessComponent<BaseProps> & IWrappedComponent<React.StatelessComponent<BaseProps>>

export default abstract class BaseNode {
    appState: IAppState
    abstract render: BaseNodeRender

    lightPos () {
        let plugin = this.appState.plugins.get('LightControlPlugin') as ILightControlPlugin
        if (!plugin || (plugin.x === 0 && plugin.y === 0))
            return normalize([0.00001, -0.00001, 1])
        else
            return hemispherical(plugin.x, plugin.y)
    }
}
