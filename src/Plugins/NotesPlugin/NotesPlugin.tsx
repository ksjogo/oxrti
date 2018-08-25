import React, { ChangeEvent } from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { List, ListItem, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, Theme, createStyles, Button, Popover, Card, CardContent, CardActions, Typography, TextField, Switch } from '@material-ui/core'
import uniqid from 'uniqid'
import TrashIcon from '@material-ui/icons/Delete'
import { Tooltip } from '../BasePlugin/BasePlugin'
import { Point, sleep, JSONY } from '../../Util'
import { IRendererPlugin } from '../RendererPlugin/RendererPlugin'

const NoteModel = types.model({
    text: 'text me',
    name: 'name me',
    id: types.string,
    pos: types.array(types.number),
    collapsed: false,
})

const NotesModel = Plugin.props({
    notes: types.optional(types.array(NoteModel), []),
})

class NotesController extends shim(NotesModel, Plugin) {

    createOnNextClick = false

    get hooks () {
        return {
            ViewerSide: {
                Notes: {
                    component: NotesUI,
                    priority: 22,
                },
            },
            ViewerMouse: {
                Notes: {
                    dragger: this.dragger,
                    mouseUp: this.mouseUp,
                    priority: 120,
                },
            },
            ViewerSurfaceAttachment: {
                Notes: {
                    component: NotesOverlay,
                },
            },
        }
    }

    @action
    toggleCreateOnNext () {
        this.createOnNextClick = !this.createOnNextClick
    }

    @action
    addNote (pos: Point) {
        let bookmark = NoteModel.create({
            id: uniqid(),
            pos: pos,
        })
        this.notes.push(bookmark)
    }

    @action
    setNoteValue (index: number, key: 'name' | 'text', value: string) {
        this.notes[index][key] = name
    }

    handleNoteValue (index: number, key: 'name' | 'text') {
        return (event: ChangeEvent<HTMLInputElement>) => {
            this.setNoteValue(index, key, event.target.value)
        }
    }

    @action
    async deleteNote (index: number) {
        this.notes.splice(index, 1)
    }

    handleDelete (index: number) {
        return (event: any) => {
            this.deleteNote(index)
        }
    }

    @action
    toogleCollapse (index: number) {
        this.notes[index].collapsed = !this.notes[index].collapsed
    }

    handleCollapse (index: number) {
        return (event: any) => {
            this.toogleCollapse(index)
        }
    }

    dragger (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point, dragging: boolean) {
        return !this.createOnNextClick
    }

    @action
    mouseUp (nextScreen: Point, nextTex: Point) {
        if (!this.createOnNextClick)
            return false

        this.addNote(nextTex)
        this.createOnNextClick = false
        return true
    }
}

const { Plugin: NotesPlugin, Component } = PluginCreator(NotesController, NotesModel, 'NotesPlugin')
export default NotesPlugin
export type INotesPlugin = typeof NotesPlugin.Type

const styles = (theme: Theme) => createStyles({
    note: {
        position: 'absolute',
    },
})

const NotesUI = Component(function NotesUI (props, classes) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <Typography variant='button'>Notes</Typography>
            <Tooltip title='Create a note on next object click'>
                <Typography>Create Next:<Switch onClick={this.toggleCreateOnNext} checked={this.createOnNextClick}>Create on next click</Switch></Typography>
            </Tooltip>
        </CardContent>
    </Card>
}, styles)

const NotesOverlay = Component(function NotesOverlay (props, classes) {
    let renderer = props.appState.plugins.get('RendererPlugin') as IRendererPlugin
    let size = renderer.surfaceSize
    return <div>
        {this.notes.map((note, index) => {
            let screened = renderer.forwardPoint(note.pos.slice(0, 2) as Point)
            if (screened[0] < 0 || screened[0] > 1 || screened[1] < 0 || screened[1] > 1)
                return null
            let left = size * screened[0]
            let top = size * (1 - screened[1])
            return <p key={note.id} className={classes.note} style={{
                top: top,
                left: left,
            }}>
                {screened[0]} {screened[1]}
            </p>
        })}
    </div>
}, styles)
