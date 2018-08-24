import ConverterStrategyConfig from './Plugins/ConverterPlugin/ConverterStrategyConfig'
import { MouseListener } from './Plugins/RendererPlugin/MouseListener'
import { Point } from './Util'
import { ChannelModel } from './BTFFile'
export { ChannelModel }
import { BaseNodeProps } from './Plugins/RendererPlugin/BaseNode'
import { TabProps } from '@material-ui/core/Tab'
import { PluginComponentType } from './Plugin'
import { Theme } from '@material-ui/core'

// generic hook definitions to allow for a typesafe hook system

/** %begin */

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

/** %end */

// specific hooks for the plugins to use

/** %AppHooksBegin */
// register a new tab
type Tab = {
    // component to be the base of the tab
    content: PluginComponentType
    tab: TabProps,
    padding?: number,
    // async functions to allow customisation before/after tabs change
    beforeFocusGain?: () => Promise<void>,
    afterFocusGain?: () => Promise<void>,
    beforeFocusLose?: () => Promise<void>,
    afterFocusLose?: () => Promise<void>,
}

// action buttons on the top rights
type ActionBar = {
    onClick: () => void,
    title: string,
    enabled: () => boolean,
    tooltip?: string,
}

// notifications if the tab changes for sub-components which are not being a tab themselves
type ViewerTabFocus = {
    beforeGain?: () => void,
    beforeLose?: () => void,
}
/** %AppHooksEnd */

/** %RendererHooksBegin */

// specific channelModel renderers can register their base node
type BaseNodeConfig = {
    channelModel: ChannelModel,
    node: PluginComponentType<BaseNodeProps>,
}

// hook for a node in the renderer stack
type RendererNode = {
    component: PluginComponentType,
    // if the node is transforming the texture coordinates, and inverse method needs to be provided
    inversePoint?: (point: Point) => Point,
}

// hook for listening to mouse event inside the main renderer
type MouseConfig = {
    listener: MouseListener,
    mouseLeft?: () => void,
}

// hook for adding file actions/buttons below the upload field
type ViewerFileAction = {
    tooltip: string,
    text: string,
    action: () => Promise<void>,
}

// hook for adding information to the metadata file when shots are exported
type ScreenshotMeta = {
    key: string,
    fullshot?: () => (string | number)[] | string | number,
    snapshot?: () => (string | number)[] | string | number,
}

// components to be rendered inside the drawer
type ViewerSide = ComponentHook

// notifications, that a btf file will be exported and plugins should update their respective data inside the current in-memory version
type PreDownload = FunctionHook

// notification that a btf file was loaded, plugins can import extra data
type PostLoad = FunctionHook

/** %RendererHooksEnd */

/** %BookmarkHooksBegin */

type BookmarkSaver = {
    key: string,
    save: () => (string | number)[],
    restore: (values: (string | number)[]) => void,
}

/** %BookmarkHooksEnd */

/** %ThemeHooksBegin */

type ThemeConfig = {
    controller: { theme: Theme },
}

/** %ThemeHooksEnd */

/** %SettingsHooksBegin */
// currently only toggles are supported
export enum SettingsType {
    Toggle = 1,
}

type SettingsConfig = {
    type: SettingsType,
    value: () => boolean,
    action: () => void,
}
/** %SettingsHooksEnd */

type HookTypes = {
    ActionBar?: ConfigHook<ActionBar>,
    AfterPluginLoads?: FunctionHook,
    AppView?: ComponentHook,
    Bookmarks?: ConfigHook<BookmarkSaver>,
    ConverterFileFormat?: ConfigHook<ConverterStrategyConfig>,
    PostLoad?: PostLoad,
    PreDownload?: PreDownload,
    RendererForModel?: ConfigHook<BaseNodeConfig>,
    ScreenshotMeta?: ConfigHook<ScreenshotMeta>
    Tabs?: ConfigHook<Tab>,
    Test?: FunctionHook,
    ViewerFileAction?: ConfigHook<ViewerFileAction>,
    ViewerMouse?: ConfigHook<MouseConfig>,
    ViewerRender?: ConfigHook<RendererNode>,
    ViewerSide?: ViewerSide,
    ViewerTabFocus?: ConfigHook<ViewerTabFocus>,
    Theme?: ConfigHook<ThemeConfig>,
    Settings?: ConfigHook<SettingsConfig>,
}
