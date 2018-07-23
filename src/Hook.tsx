import { PluginComponentType } from './View/Component'
import { TabConfig } from './View/Tabs'
import ConverterStrategyConfig from './Plugins/ConverterPlugin/ConverterStrategyConfig'

export type HookBase = {
    priority?: number,
    name?: string,
}

export type ComponentHook<P = PluginComponentType> = HookBase & {
    component: P,
}

export type FunctionHook<P= any> = HookBase & {
    func: P,
}

export type ConfigHook<P = any> = HookBase & P

export type ComponentHooks<P = PluginComponentType> = { [key: string]: ComponentHook<P> }
export type FunctionHooks<P = any> = { [key: string]: FunctionHook<P> }
export type ConfigHooks<P = any> = { [key: string]: ConfigHook<P> }

export type HookConfig = {
    ViewerRender?: ComponentHooks,
    ViewerSide?: ComponentHooks,
    Test?: FunctionHooks,
    Tabs?: ConfigHooks<TabConfig>,
    ConverterFileFormat?: ConfigHooks<ConverterStrategyConfig>,
}

type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

export type HookName = keyof HookConfig
export type HookNameComponent = LimitedHooks<HookConfig, ComponentHooks<any>>
export type HookNameFunction = LimitedHooks<HookConfig, FunctionHooks<any>>
export type HookNameConfig = LimitedHooks<HookConfig, ConfigHooks<any>>
