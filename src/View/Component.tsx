import { observer, inject, IWrappedComponent } from 'mobx-react'
import React, { SFC } from 'react'
import { IAppState } from '../State/AppState'
import { withStyles } from '@material-ui/core/styles'

interface ComponentProps {
    appState?: IAppState,
}

export { ComponentProps }

export default function Component<Props = {}> (inner: SFC<ComponentProps & Props>, styles?: any) {
    if (!styles) {
        return inject('appState')(observer(inner))
    } else {
        let InnerMost = withStyles(styles)(observer((props) => {
            return inner.apply(inner, [props, props.classes])
        }))
        return inject('appState')(function (props) {
            return <InnerMost appState={props.appState} />
        })
    }

}

export type ComponentType = ReturnType<typeof Component>
export type PluginComponentType = React.StatelessComponent<ComponentProps> & IWrappedComponent<React.StatelessComponent<ComponentProps>>
