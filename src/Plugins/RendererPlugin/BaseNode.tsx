import { ComponentProps } from '../../View/Component'
import { IWrappedComponent } from 'mobx-react'
import { IAppState } from '../../State/AppState'

export default abstract class BaseNode {
    appState: IAppState
    abstract render: React.StatelessComponent<ComponentProps> & IWrappedComponent<React.StatelessComponent<ComponentProps>>

    lightPos () {
        let plugin = this.appState.plugins.get('LightControlPlugin') as any
        if (!plugin)
            return [0.5, 0.5, 1]
        else
            return [plugin.x, plugin.y, 1]
    }
}
