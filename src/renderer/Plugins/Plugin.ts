import { IModelType } from 'mobx-state-tree'
import { ModelInterface } from 'classy-mst'
import { Component } from 'react'

export default class Plugin<S = {}, T= {}> {
    name = ''

    constructor (
        name: string,
        model: IModelType<S, T>,
        controller: ModelInterface<S, T>,
        view: new () => Component,
    ) {
        this.name = name
    }
}
