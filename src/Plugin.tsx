import { types, IModelType } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import { ComponentProps, PluginComponentType } from './View/Component'
import React, { ReactNode, ReactElement } from 'react'
import { Shaders, Node } from 'gl-react'
import { HookConfig, HookName, ComponentHook, FunctionHook } from './Hook'
import { IAppState } from './State/AppState'
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import { Point } from './Math';
import { IRendererPlugin } from './Plugins/RendererPlugin/RendererPlugin';

/**
 * Plugin Model/State, is preserved in the app wide state tree
 */
const PluginModel = types.model({
})

/**
 * Plugin Code
 * functions without @action are `views` and cannot change the model
 * only actions can do so
 * instance variables are `volatile`, so not preserved between plugin reloads etc.
 * refer to [mst docs](https://github.com/charto/classy-mst) for details.
 */
class PluginController extends shim(PluginModel) {

    // volatile access to app state
    appState: IAppState

    /**
     * A plugin shall be loaded, otherwise it might lay dormant and not do much
     */
    @action
    load (appState: IAppState) {
        this.appState = appState
    }

    get hooks (): HookConfig {
        return {}
    }

    hook (name: HookName, instance: string) {
        return this.hooks[name][instance]
    }

    componentHook (name: HookName, instance: string): ComponentHook {
        return this.hook(name, instance) as ComponentHook
    }

    functionHook (name: HookName, instance: string): FunctionHook {
        return this.hook(name, instance) as FunctionHook
    }

    hotUnload () {
        //
    }

    hotReload () {
        //
    }

    inversePoint (point: Point) {
        let renderer = this.appState.plugins.get('RendererPlugin') as IRendererPlugin
        return renderer.inversePoint(point)
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
    // we could potentially extract a better style definition though
    type innerType<P> = (this: typeof SubPlugin.Type, props: ComponentProps & { children?: ReactNode } & P, classes?: any) => ReactElement<any> | null
    // can we type the styles somehow?
    function SubComponent<P = {}> (inner: innerType<P>, styles?: any): PluginComponentType<P> {
        // wrapper function to extract the corresponding plugin from props into plugin argument typedly
        if (!styles) {
            return inject('appState')(observer(function (props) {
                let plugin = (props.appState.plugins.get(name)) as any
                // actual rendering function
                // allow this so all code inside a plugin can just refer to this
                return inner.apply(plugin, [props])
            }))
        } else {
            // material ui needs an extra hoc wrapper
            // and slightly different observer ordering
            // cache the actual inner function
            let InnerMost = withStyles(styles)(observer((props) => {
                return inner.apply(props.plugin, [props, props.classes])
            }))
            return inject('appState')(function (props) {
                let plugin = (props.appState.plugins.get(name))
                return <InnerMost plugin={plugin} appState={props.appState} {...props} />
            })
        }
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
    width?: number,
    height?: number,
    clear?: boolean,
    shader: any,
    ref?: (ref) => void,
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
