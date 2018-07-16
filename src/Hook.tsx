import { IWrappedComponent } from 'mobx-react'
import { ComponentProps } from './View/Component'

export type HookBase = {
    priority: number,
    name?: string,
}

export type ComponentHook = HookBase & {
    component: React.StatelessComponent<ComponentProps> & IWrappedComponent<React.StatelessComponent<ComponentProps>>,
}

export type FunctionHook = HookBase & {
    func: Function,
}

export type ComponentHooks = { [key: string]: ComponentHook }
export type FunctionHooks = { [key: string]: FunctionHook }

export type HookConfig = {
    ViewerRender?: ComponentHooks,
    ViewerSide?: ComponentHooks,
    Test?: FunctionHooks,
}

type LimitedHooks<T, U> = ({ [P in keyof T]: T[P] extends U ? P : never })[keyof T]

export type HookName = keyof HookConfig
export type HookNameComponent = LimitedHooks<HookConfig, ComponentHooks>
export type HookNameFunction = LimitedHooks<HookConfig, FunctionHooks>
