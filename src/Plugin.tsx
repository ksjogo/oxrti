import { types, IModelType, ModelProperties } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import React, { ReactNode, ReactElement } from 'react'
import { Shaders, Node } from 'gl-react'
import { HookConfig, HookName, ComponentHook, FunctionHook, HookType } from './Hook'
import { IAppState } from './AppState'
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core'
import { observer, inject, IWrappedComponent } from 'mobx-react'
import { Point } from './Math'
import { IRendererPlugin } from './Plugins/RendererPlugin/RendererPlugin'

/**
 * Plugin Model/State, is preserved in the app wide state tree
 */
const PluginModel = types.model({
})

const refCache: { [key: string]: { [key: string]: any } } = {}

interface ComponentProps {
    appState?: IAppState,
}

export { ComponentProps }
export type ComponentType = ((props: any) => JSX.Element) & IWrappedComponent<(props: any) => JSX.Element>
export type PluginComponentType<P = {}> = React.StatelessComponent<ComponentProps & P> & IWrappedComponent<React.StatelessComponent<ComponentProps & P>>

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
     * will inject the appState reference into the plugin as mobx's inject can't be used
     */
    @action
    load (appState: IAppState) {
        this.appState = appState
    }

    /**
     * all hooks the plugin is using
     */
    get hooks (): HookConfig {
        return {}
    }

    /**
     * get single hook config
     */
    hook<P extends HookName> (name: P, instance: string): HookType<P> {
        return this.hooks[name][instance]
    }

    /**
     * called before the plugin will be deleted from the state tree
     */
    hotUnload () {
        //
    }

    /**
     * called after the plugin was restored in the state tree
     */
    hotReload () {
        //
    }

    /**
     * inverse a rendering point
     * move point from surface coordinates into texture coordinates
     */
    inversePoint (point: Point): Point {
        let renderer = this.appState.plugins.get('RendererPlugin') as IRendererPlugin
        if (!renderer)
            throw new Error('Need RendererPlugin to inversePoint')
        return renderer.inversePoint(point)
    }

    /**
     * non-action based ref handler to allow deletion of refs from unmounted plugins/components
     * otherwise a plugin will be deleted, the ref trigger, and then an action on the old non living plugin be called
     * @param id namespaced into the plugin
     */
    handleRef (id: string) {
        let key = (this as any).$
        return (ref: any) => {
            if (!refCache[key])
                refCache[key] = {}
            if (refCache[key][id] !== ref)
                refCache[key][id] = ref
        }
    }

    /**
     * return a stored ref
     * @param id namespaced into the plugin
     */
    ref (id: string) {
        let key = (this as any).$
        if (!refCache[key])
            return null
        return refCache[key][id]
    }
}

/**
 * Actual Plugin `class` which will be used as superclass
 */
const Plugin = mst(PluginController, PluginModel, 'Plugin')
type IPlugin = typeof Plugin.Type
export { IPlugin }
/**
 * Create Subplugins
 * @param Code is the controller, extending this Plugin
 * @param Data is the model, extendings this Plugins model
 * @param name must be the same as the folder and filename
 */
function PluginCreator<S extends ModelProperties, T, U> (Code: new () => U, Data: IModelType<S, T>, name: string) {
    let SubPlugin = mst(Code, Data, name)
    // outer level constructor function
    // inner is basically (plugin, props) => ReactElement
    // we could potentially extract a better style definition though
    type innerType<P> = (this: typeof SubPlugin.Type, props: ComponentProps & { children?: ReactNode } & P, classes?: any) => ReactElement<any>
    // can we type the styles somehow?
    function SubComponent<P = {}> (inner: innerType<P>, styles?: any): PluginComponentType<P> {
        // wrapper function to extract the corresponding plugin from props into plugin argument typedly
        let innerMost = function (props: any) {
            let plugin = (props.appState.plugins.get(name)) as typeof SubPlugin.Type
            // actual rendering function
            // allow this so all code inside a plugin can just refer to this
            let innerProps = [props]
            if (styles)
                innerProps.push(props.classes)
            return inner.apply(plugin, innerProps)
        };
        (innerMost as any).displayName = inner.name
        let func: any = inject('appState')(observer(innerMost))
        if (styles)
            func = withStyles(styles)(func);
        (func as PluginComponentType<P>).displayName = `PluginComponent(${inner.name})`
        return func
    }

    // allow easier renaming in the calling module
    return { Plugin: SubPlugin, Component: SubComponent }
}

export default Plugin
export {
    PluginCreator,
}
