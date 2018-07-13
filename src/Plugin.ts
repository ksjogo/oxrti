import { types, IModelType } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import Component, { ComponentProps } from './View/Component'
import { ReactNode, ReactElement } from 'react'
import { IWrappedComponent } from 'mobx-react'

const PluginModel = types.model({
    title: types.string,
    loaded: false,
})

interface IPluginController {
    components (): { [key: string]: React.SFC<ComponentProps> }
}

class PluginController extends shim(PluginModel) implements IPluginController {

    @action
    prepareHooks () {
        console.log('PluginController Hooked')
    }

    @action
    load () {
        this.loaded = true
    }

    components () {
        return {}
    }
}

const Plugin = mst(PluginController, PluginModel, 'Plugin')

function PluginCreator<S, T, U> (Code: new () => U, Data: IModelType<S, T>, name: string) {
    let SubPlugin = mst(Code, Data, name)
    type pluginType = typeof SubPlugin.Type
    type propsType = ComponentProps & { children?: ReactNode }
    type returnType = ReactElement<any> | null
    let SubComponent = function (inner: (plugin: pluginType, props: propsType) => returnType) {
        return Component(function (props) {
            let plugin = (props.appState.plugins.get(name)) as any
            return inner(plugin, props)
        })
    }
    return { Plugin: SubPlugin, Component: SubComponent }
}

export default Plugin
export {
    types as types,
    shim as shim,
    action as action,
    PluginCreator as PluginCreator,
}
