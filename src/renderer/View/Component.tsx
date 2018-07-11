import { observer, Provider, inject } from 'mobx-react'
import * as React from 'react'
import { IAppState } from '../State/AppState'

interface ComponentProps {
    appState?: IAppState,
}

export default function Component<P> (inner: React.SFC<ComponentProps & P>) {
    return inject('appState')(observer(inner))
}
