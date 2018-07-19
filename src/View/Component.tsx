import { observer, inject, IWrappedComponent } from 'mobx-react'
import { SFC } from 'react'
import { IAppState } from '../State/AppState'

interface ComponentProps {
    appState?: IAppState,
}

export { ComponentProps }

export default function Component<Props = {}> (inner: SFC<ComponentProps & Props>) {
    return inject('appState')(observer(inner))
}

export type ComponentType = ReturnType<typeof Component>
export type PluginComponentType = React.StatelessComponent<ComponentProps> & IWrappedComponent<React.StatelessComponent<ComponentProps>>