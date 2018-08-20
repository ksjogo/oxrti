import ConverterStrategyConfig from './Plugins/ConverterPlugin/ConverterStrategyConfig'
import { MouseListener } from './Plugins/RendererPlugin/MouseListener'
import { Point } from './Math'
import { ChannelModel } from './BTFFile'
export { ChannelModel }
import { BaseNodeProps } from './Plugins/RendererPlugin/BaseNode'
import { TabProps } from '@material-ui/core/Tab'
import { PluginComponentType } from './Plugin'
import { Theme } from '@material-ui/core'

// generic hook definitions to allow for a typesafe hook system

// %begin

// Hooks are sorted in descending priority order in their respective `HookManager`
export type HookBase = { priority?: number }

// Generic single component hook, usually used for rendering a dynamic list of components
export type ComponentHook<P = PluginComponentType> = HookBase & { component: P }

// Generic single component hook, usually used for notifications
export type FunctionHook<P = (...args: any[]) => any> = HookBase & { func: P }

// Generic hook config, requiring more work at the consumer side
export type ConfigHook<P = any> = HookBase & P

// union of all hooks to allow for manual hook distinction
export type UnknownHook = ComponentHook & FunctionHook & ConfigHook

// object of named hooks
type Hooks<P> = { [key: string]: P }

// collection of unknown hooks
export type UnknownHooks = Hooks<UnknownHook>

// hook configuration inside plugins: 1-Hookname->*-LocalName->1-HookConfig
export type HookConfig = { [P in keyof HookTypes]: Hooks<HookTypes[P]> }

// all hooknames
export type HookName = keyof HookConfig

// map one hookname to its type
export type HookType<P extends HookName> = HookTypes[P]

// list of hooknames inside hook collection T, having hooktype U
type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

// limit hookname parameters to a type conforming subset, e.g. LimitedHook<ComponentHook>
export type LimitedHook<P> = LimitedHooks<HookConfig, Hooks<P>>

// %end

// specific hooks for the plugins to use

// %AppHooksBegin

type Tab = {
    content: PluginComponentType
    tab: TabProps,
    padding?: number,
    beforeFocusGain?: () => Promise<void>,
    afterFocusGain?: () => Promise<void>,
    beforeFocusLose?: () => Promise<void>,
    afterFocusLose?: () => Promise<void>,
}

type ActionBar = {
    onClick: () => void,
    title: string,
    enabled: () => boolean,
    tooltip?: string,
}

type ViewerTabFocus = {
    beforeGain?: () => void,
    beforeLose?: () => void,
}

type ScreenshotMeta = {
    key: string,
    fullshot?: () => (string | number)[] | string | number,
    snapshot?: () => (string | number)[] | string | number,
}

type ViewerFileAction = {
    tooltip: string,
    text: string,
    action: () => Promise<void>,
}

// %AppHooksEnd

// %RendererHooksBegin

type BaseNodeConfig = {
    channelModel: ChannelModel,
    node: PluginComponentType<BaseNodeProps>,
}

type RendererNode = {
    component: PluginComponentType,
    inversePoint?: (point: Point) => Point,
}

type MouseConfig = {
    listener: MouseListener,
    mouseLeft?: () => void,
}

// %RendererHooksEnd

// %BookmarkHooksBegin

type BookmarkSaver = {
    key: string,
    save: () => (string | number)[],
    restore: (values: (string | number)[]) => void,
}

// %BookmarkHooksEnd

// %ThemeHooksBegin

type ThemeConfig = {
    controller: { theme: Theme },
}

// %ThemeHooksEnd

type HookTypes = {
    ActionBar?: ConfigHook<ActionBar>,
    AfterPluginLoads?: FunctionHook,
    AppView?: ComponentHook,
    Bookmarks?: ConfigHook<BookmarkSaver>,
    ConverterFileFormat?: ConfigHook<ConverterStrategyConfig>,
    PostLoad?: FunctionHook,
    PreDownload?: FunctionHook,
    RendererForModel?: ConfigHook<BaseNodeConfig>,
    ScreenshotMeta?: ConfigHook<ScreenshotMeta>
    Tabs?: ConfigHook<Tab>,
    Test?: FunctionHook,
    ViewerFileAction?: ConfigHook<ViewerFileAction>,
    ViewerMouse?: ConfigHook<MouseConfig>,
    ViewerRender?: ConfigHook<RendererNode>,
    ViewerSide?: ComponentHook,
    ViewerTabFocus?: ConfigHook<ViewerTabFocus>,
    Theme?: ConfigHook<ThemeConfig>,
}
