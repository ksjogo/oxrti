import { types, IModelType, ModelProperties } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
import React, { ReactNode, ReactElement } from 'react'
import { Shaders, Node } from 'gl-react'
import { HookConfig, HookName, ComponentHook, FunctionHook, HookType } from './Hook'
import { IAppState } from './AppState'
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core'
import { observer, inject, IWrappedComponent } from 'mobx-react'
import { Point } from './Util'
import { IRendererPlugin } from './Plugins/RendererPlugin/RendererPlugin'
import { StyleRules } from '@material-ui/core/styles'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'

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

const PluginShim = shim(PluginModel)

/** %begin */
/** General Plugin controller, will be loaded into the MobX state tree */
export class PluginController extends PluginShim {

    /** referential access to app state, will be set by the plugin loader */
    appState: IAppState

    /** called when the plugin is initally loaded from file */
    @action
    load (appState: IAppState) {
        this.appState = appState
    }

    /** all hooks the plugin is using */
    get hooks (): HookConfig {
        return {}
    }

    /** get a single typed hook */
    hook<P extends HookName> (name: P, instance: string): HookType<P> {
        return this.hooks[name][instance]
    }

    /** called before the plugin will be deleted from the state tree, ususally used for volatile state fixes, e.g. paint layers */
    hotUnload () {
        //
    }

    /** called after the plugin was restored in the state tree */
    hotReload () {
        //
    }

    /** convenience function to inverse a rendering point from surface coordinates into texture coordinates */
    inversePoint (point: Point): Point {
        this.appState.hookForEachReverse('ViewerRender', (hook) => {
            if (hook.inversePoint)
                point = hook.inversePoint(point)
        })
        return point
    }

    /** some components need references to their actual DOM nodes, these are stored outside the plugins scope to allow hot-reloads */
    handleRef (id: string) {
        let key = (this as any).$
        return (ref: any) => {
            if (!refCache[key])
                refCache[key] = {}
            if (refCache[key][id] !== ref)
                refCache[key][id] = ref
        }
    }

    /** return a stored ref */
    ref (id: string) {
        let key = (this as any).$
        if (!refCache[key])
            return null
        return refCache[key][id]
    }
}
/** %end */

/**
 * Actual Plugin `class` which will be used as superclass
 */
const Plugin = mst(PluginController, PluginModel, 'Plugin')
type IPlugin = typeof Plugin.Type
export { IPlugin }

/** %beginCreator */
/**
 * Create Subplugins
 * @param Code is the controller
 * @param Data is the model
 * @param name must be the same as the folder and filename
 */
function PluginCreator<S extends ModelProperties, T, U> (Code: new () => U, Data: IModelType<S, T>, name: string) {
    // create the resulting plugin class
    let SubPlugin = mst(Code, Data, name)
    // higher-order-component
    // inner is basically (props, classes?) => ReactElement
    // inner this will be bound to the SubPlugin instance
    type innerType<P, C extends string> = (this: typeof SubPlugin.Type, props: ComponentProps & { children?: ReactNode } & P, classes?: ClassNameMap<C>) => ReactElement<any>
    // P are they freely definable properties of the embedded react component
    // C are the inffered class keys for styling, usually no need to manually pass them
    function SubComponent<P = {}, C extends string = ''> (inner: innerType<P, C>, styles?: StyleRulesCallback<C>): PluginComponentType<P> {
        // wrapper function to extract the corresponding plugin from props into plugin argument typedly
        let innerMost = function (props: any) {
            let plugin = (props.appState.plugins.get(name)) as typeof SubPlugin.Type
            // actual rendering function
            // allow this so all code inside a plugin can just refer to this
            let innerProps = [props]
            // append styles
            if (styles)
                innerProps.push(props.classes)
            // call the embedded component
            return inner.apply(plugin, innerProps)
        };
        // set a nice name for the MobX/redux dev tools
        (innerMost as any).displayName = inner.name
        // use MobX higher order functions to link into the state tree
        let func: any = inject('appState')(observer(innerMost))
        // wrap with material-ui styles if provided
        if (styles)
            func = withStyles(styles)(func);
        // also name the wrapped function for dev tools
        (func as PluginComponentType<P>).displayName = `PluginComponent(${inner.name})`
        return func
    }
    // allow easier renaming in the calling module
    return { Plugin: SubPlugin, Component: SubComponent }
}
/** %endCreator */

export default Plugin
export {
    PluginCreator,
}
