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

export type ConfigHook<P = any> = HookBase & {
} & P

export type RendererHook<P = PluginComponentType> = ComponentHook<P> & {
    inversePoint?: (point: Point) => Point,
}

export type BaseNodeConfig = {
    channelModel: ChannelModel,
    node: BaseNode,
}

type Hooks<P> = { [key: string]: P }

export type ViewerTabFocusHook = {
    beforeGain?: () => void,
    beforeLose?: () => void,
}
export type DraggerConfig = {
    dragger: Dragger,
    draggerLeft?: () => void,
}

export type BookmarkSaver = {
    key: string,
    save: () => (string | number)[],
    restore: (values: (string | number)[]) => void,
}

export type ScreenshotMeta = {
    key: string,
    fullshot?: () => (string | number)[] | string | number,
    snapshot?: () => (string | number)[] | string | number,
}

export type HookTypes = {
    ViewerTabFocus?: ConfigHook<ViewerTabFocusHook>,
    ViewerRender?: RendererHook,
    ViewerSide?: ComponentHook,
    ViewerDrag?: ConfigHook<DraggerConfig>,
    ViewerFileAction?: ComponentHook,
    ScreenshotMeta?: ConfigHook<ScreenshotMeta>
    PreDownload?: FunctionHook,
    PostLoad?: FunctionHook,
    Test?: FunctionHook,
    Tabs?: ConfigHook<TabConfig>,
    ConverterFileFormat?: ConfigHook<ConverterStrategyConfig>,
    RendererForModel?: ConfigHook<BaseNodeConfig>,
    Bookmarks?: ConfigHook<BookmarkSaver>,
}

export type HookConfig = {
    [P in keyof HookTypes]: Hooks<HookTypes[P]>
}
export type HookName = keyof HookConfig

export type HookType<P extends HookName> = HookTypes[P]

type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

export type HookNameComponent = LimitedHooks<HookConfig, Hooks<ComponentHook<any>>>
export type HookNameFunction = LimitedHooks<HookConfig, Hooks<FunctionHook<any>>>
export type HookNameConfig = LimitedHooks<HookConfig, Hooks<ConfigHook<any>>>