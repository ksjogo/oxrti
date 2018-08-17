import ConverterStrategyConfig from './Plugins/ConverterPlugin/ConverterStrategyConfig'
import { MouseListener } from './Plugins/RendererPlugin/MouseListener'
import { Point } from './Math'
import { ChannelModel } from './BTFFile'
export { ChannelModel }
import { BaseNodeProps } from './Plugins/RendererPlugin/BaseNode'
import { TabProps } from '@material-ui/core/Tab'
import { PluginComponentType } from './Plugin'

// generic hook definitions to allow for a typesafe hook system

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

export type UnknownHook = ComponentHook & FunctionHook & ConfigHook

type Hooks<P> = { [key: string]: P }

export type UnknownHooks = Hooks<UnknownHook>

export type HookConfig = {
    [P in keyof HookTypes]: Hooks<HookTypes[P]>
}
export type HookName = keyof HookConfig

export type HookType<P extends HookName> = HookTypes[P]

type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

export type HookNameComponent = LimitedHooks<HookConfig, Hooks<ComponentHook<any>>>
export type HookNameFunction = LimitedHooks<HookConfig, Hooks<FunctionHook<any>>>
export type HookNameConfig = LimitedHooks<HookConfig, Hooks<ConfigHook<any>>>

// specific hooks follow

type BaseNodeConfig = {
    channelModel: ChannelModel,
    node: PluginComponentType<BaseNodeProps>,
}

type ViewerTabFocus = {
    beforeGain?: () => void,
    beforeLose?: () => void,
}

type MouseConfig = {
    listener: MouseListener,
    mouseLeft?: () => void,
}

type BookmarkSaver = {
    key: string,
    save: () => (string | number)[],
    restore: (values: (string | number)[]) => void,
}

type ScreenshotMeta = {
    key: string,
    fullshot?: () => (string | number)[] | string | number,
    snapshot?: () => (string | number)[] | string | number,
}

type RendererNode = {
    component: PluginComponentType,
    inversePoint?: (point: Point) => Point,
}

type Tab = {
    content: PluginComponentType
    tab: TabProps,
    padding?: number,
    beforeFocusGain?: () => Promise<void>,
    afterFocusGain?: () => Promise<void>,
    beforeFocusLose?: () => Promise<void>,
    afterFocusLose?: () => Promise<void>,
}

type HookTypes = {
    ViewerTabFocus?: ConfigHook<ViewerTabFocus>,
    ViewerRender?: ConfigHook<RendererNode>,
    ViewerSide?: ComponentHook,
    ViewerMouse?: ConfigHook<MouseConfig>,
    ViewerFileAction?: ComponentHook,
    ScreenshotMeta?: ConfigHook<ScreenshotMeta>
    PreDownload?: FunctionHook,
    PostLoad?: FunctionHook,
    Test?: FunctionHook,
    Tabs?: ConfigHook<Tab>,
    ConverterFileFormat?: ConfigHook<ConverterStrategyConfig>,
    RendererForModel?: ConfigHook<BaseNodeConfig>,
    Bookmarks?: ConfigHook<BookmarkSaver>,
}
