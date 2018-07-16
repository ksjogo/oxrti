import { types, IModelType } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import Component, { ComponentProps } from './View/Component'
import React, { ReactNode, ReactElement } from 'react'
import { Shaders, Node } from 'gl-react'

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

    /**
     * Actually hook into the
     */
    @action
    prepareHooks (appState: any) {
        console.log('PluginController Hooked')
    }

    /**
     * A plugin shall be loaded, otherwise it might lay dormant and not do much
     */
    @action
    load () {
        this.loaded = true
    }

    /**
     * A plugin's components to be referenced on a string basis
     * Our base PluginController doesn't have empty and remains empty to not interfer with mobx-state-tree subclassing for the moment
     * If we define components here, subsclasses will also have to define them, we should introduce some merging potentially
     */
    components (): { [key: string]: React.SFC<ComponentProps> } {
        return {}
    }

    /**
     *
     * @param name of a specific view
     */
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
    // outer level constructor function
    // inner is basically (plugin, props) => ReactElement
    // we could potentially extract the definition and do a templated type
    let SubComponent = function (inner: (plugin: typeof SubPlugin.Type, props: ComponentProps & { children?: ReactNode }) => ReactElement<any> | null) {
        // wrapper function to extract the corresponding plugin from props into plugin argument typedly
        return Component(function (props) {
            let plugin = (props.appState.plugins.get(name)) as any
            // actual rendering function
            return inner(plugin, props)
        })
    }
    // allow easier renaming in the calling module
    return { Plugin: SubPlugin, Component: SubComponent }
}

type ActualShader = string
type ShaderConfig = {
    frag: string,
    vert?: string,
}

type TypedCreate = (config: { [key: string]: ShaderConfig }) => {
    [key: string]: ActualShader,
}

const TypedShaders: {
    create: TypedCreate,
} = Shaders

const TypedNode: React.StatelessComponent<{
    uniforms?: any,
    uniformOptions?: any,
    shader: any,
}> = Node

/**
 * Facading the classy-mst and mobx-state-tree exports to simplfy importing and allow proxy changes without changing plugin code
 */
export default Plugin
export {
    types as types,
    shim as shim,
    action as action,
    PluginCreator as PluginCreator,
    TypedShaders as Shaders,
    TypedNode as ShaderNode,
    TypedNode,
}
