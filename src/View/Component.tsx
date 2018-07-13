import { observer, Provider, inject } from 'mobx-react'
import * as React from 'react'
import { IAppState } from '../State/AppState'

interface ComponentProps {
    appState?: IAppState,
}

export { ComponentProps }

export default function Component<Props = {}> (inner: React.SFC<ComponentProps & Props>) {
    return inject('appState')(observer(inner))
}
