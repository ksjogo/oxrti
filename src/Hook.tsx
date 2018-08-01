import { PluginComponentType } from './View/Component'
import { TabConfig } from './View/Tabs'
import ConverterStrategyConfig from './Plugins/ConverterPlugin/ConverterStrategyConfig'
import { Dragger } from './Plugins/RendererPlugin/DragInterface'
import { Point } from './Math'
import { Renderer } from 'react-dom'

export type HookBase = {
    priority?: number,
    name?: string,
}

export type ComponentHook<P = PluginComponentType> = HookBase & {
    component: P,
}

export type FunctionHook<P = any> = HookBase & {
    func: P,
}

export type ConfigHook<P = any> = HookBase & P

export type RendererHook<P = PluginComponentType> = ComponentHook<P> & {
    inversePoint: (point: Point) => Point,
}

type Hooks<P> = { [key: string]: P }

export type ComponentHooks<P = PluginComponentType> = Hooks<ComponentHook<P>>
export type FunctionHooks<P = any> = Hooks<FunctionHook<P>>
export type ConfigHooks<P = any> = Hooks<ConfigHook<P>>
export type RendererHooks<P = PluginComponentType> = Hooks<RendererHook<P>>

export type HookConfig = {
    ViewerRender?: RendererHooks,
    ViewerSide?: ComponentHooks,
    ViewerDrag?: FunctionHooks<Dragger>,
    Test?: FunctionHooks,
    Tabs?: ConfigHooks<TabConfig>,
    ConverterFileFormat?: ConfigHooks<ConverterStrategyConfig>,
}

type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

export type HookName = keyof HookConfig
export type HookNameComponent = LimitedHooks<HookConfig, ComponentHooks<any>>
export type HookNameFunction = LimitedHooks<HookConfig, FunctionHooks<any>>
export type HookNameConfig = LimitedHooks<HookConfig, ConfigHooks<any>>
