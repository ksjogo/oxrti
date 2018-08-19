import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { IAppState } from '../../AppState'
import { UndoManager } from 'mst-middlewares'
import { observable } from 'mobx'
type um = ReturnType<typeof UndoManager.create>

const UndoModel = Plugin.props({
    extra: 20,
})

class UndoController extends shim(UndoModel, Plugin) {

    get hooks () {
        return {
            ActionBar: {
                Undo: {
                    priority: 21,
                    onClick: this.undo,
                    title: 'Undo',
                    enabled: this.undoEnabled,
                },
                Redo: {
                    priority: 20,
                    onClick: this.redo,
                    title: 'Redo',
                    enabled: this.redoEnabled,
                },
            },
            AfterPluginLoads: {
                Undo: {
                    func: this.clear,
                },
            },
        }
    }
    undoManager: um

    @action
    undo () {
        this.undoManager.undo()
    }

    undoEnabled () {
        return this.undoManager.canUndo
    }

    @action
    redo () {
        this.undoManager.redo()
    }

    redoEnabled () {
        return this.undoManager.canRedo
    }

    @action
    clear () {
        this.undoManager = UndoManager.create({}, { targetStore: this.appState })
    }
}

const { Plugin: UndoPlugin, Component } = PluginCreator(UndoController, UndoModel, 'UndoPlugin')
export default UndoPlugin
export type IUndoPlugin = typeof UndoPlugin.Type
