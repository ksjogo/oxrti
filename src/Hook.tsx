import { PluginComponentType } from './View/Component'
import { TabConfig } from './View/Tabs'
import ConverterStrategyConfig from './Plugins/ConverterPlugin/ConverterStrategyConfig'
import { Dragger } from './Plugins/RendererPlugin/DragInterface'
import { Point } from './Math'
import { Renderer } from 'react-dom'
import { ChannelModel } from './BTFFile'
import BaseNode from './Plugins/RendererPlugin/BaseNode'

export { ChannelModel }

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

export type AsyncFunctionHook<P = void> = FunctionHook<() => Promise<P>>

export type ConfigHook<P = any> = HookBase & P

export type RendererHook<P = PluginComponentType> = ComponentHook<P> & {
    inversePoint?: (point: Point) => Point,
}

export type BaseNodeConfig = {
    channelModel: ChannelModel,
    node: BaseNode,
}

type Hooks<P> = { [key: string]: P }

export type ComponentHooks<P = PluginComponentType> = Hooks<ComponentHook<P>>
export type FunctionHooks<P = any> = Hooks<FunctionHook<P>>
export type ConfigHooks<P = any> = Hooks<ConfigHook<P>>
export type RendererHooks<P = PluginComponentType> = Hooks<RendererHook<P>>

export type TabsConfig = ConfigHooks<TabConfig>
export type ViewerTabFocusHook = {
    beforeGain?: () => void,
    beforeLose?: () => void,
}
export type ViewerTabFocusHooks = ConfigHooks<ViewerTabFocusHook>

export type DraggerConfig = {
    dragger: Dragger,
    draggerLeft?: () => void,
}

export type BookmarkSaver = {
    key: string,
    save: () => (string | number)[],
    restore: (values: (string | number)[]) => void,
}

export type HookConfig = {
    ViewerTabFocus?: ViewerTabFocusHooks,
    ViewerRender?: RendererHooks,
    ViewerSide?: ComponentHooks,
    ViewerDrag?: ConfigHooks<DraggerConfig>,
    PreDownload?: FunctionHooks,
    PostLoad?: FunctionHooks,
    Test?: FunctionHooks,
    Tabs?: TabsConfig,
    ConverterFileFormat?: ConfigHooks<ConverterStrategyConfig>,
    RendererForModel?: ConfigHooks<BaseNodeConfig>,
    Bookmarks?: ConfigHooks<BookmarkSaver>,
}

type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

export type HookName = keyof HookConfig
export type HookNameComponent = LimitedHooks<HookConfig, ComponentHooks<any>>
export type HookNameFunction = LimitedHooks<HookConfig, FunctionHooks<any>>
export type HookNameConfig = LimitedHooks<HookConfig, ConfigHooks<any>>
