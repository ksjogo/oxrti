import { types, IModelType } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import Component, { ComponentProps } from './View/Component'
import { ReactNode, ReactElement } from 'react'

/**
 * Plugin Model/State, is preserved in the app wide state tree
 */
const PluginModel = types.model({
    title: types.string,
    loaded: false,
})

/**
 * Plugin Code
 * functions without @action are `views` and cannot change the model
 * only actions can do so
 * instance variables are `volatile`, so not preserved between plugin reloads etc.
 * refer to [mst docs](https://github.com/charto/classy-mst) for details.
 */
class PluginController extends shim(PluginModel) {

    @action
    prepareHooks () {
        console.log('PluginController Hooked')
    }

    @action
    load () {
        this.loaded = true
    }

    /**
     * A plugin's components to be referenced on a string basis
     */
    components (): { [key: string]: React.SFC<ComponentProps> } {
        return {}
    }

    component (name: string) {
        return this.components()[name]
    }
}

/**
 * Actual Plugin `class`
 */
const Plugin = mst(PluginController, PluginModel, 'Plugin')

/**
 * Create Subplugins
 * @param Code is the controller, extending this Plugin
 * @param Data is the model, extendings this Plugins model
 * @param name must be the same as the folder and filename
 */
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

/**
 * Facading the classy-mst and mobx-state-tree exports to simplfy importing and allow proxy changes without changing plugin code
 */
export default Plugin
export {
    types as types,
    shim as shim,
    action as action,
    PluginCreator as PluginCreator,
}
