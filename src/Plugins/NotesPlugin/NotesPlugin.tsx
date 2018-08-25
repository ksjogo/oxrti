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
import { Popper } from 'react-popper'

const NoteModel = types.model({
    text: 'text me',
    name: 'name me',
    id: types.string,
    pos: types.array(types.number),
    collapsed: false,
    needsRepaint: false,
})

const NotesModel = Plugin.props({
    notes: types.optional(types.array(NoteModel), []),
})

class NotesController extends shim(NotesModel, Plugin) {

    createOnNextClick = false

    get hooks () {
        return {
            ViewerSide: {
                NotesOverlay: {
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
                NotesPopers: {
                    component: NotesPopers,
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
        return this.createOnNextClick
    }

    @action
    mouseUp (nextScreen: Point, nextTex: Point) {
        if (!this.createOnNextClick)
            return false

        this.addNote(nextTex)
        this.createOnNextClick = false
        return true
    }

    @action
    setDisplayPos (index: number, value: Point) {
        this.notes[index].displayPos = value
    }

    displayPos (index: number) {
        let renderer = this.appState.plugins.get('RendererPlugin') as IRendererPlugin
        let size = renderer.surfaceSize
        let note = this.notes[index]
        let screened = renderer.forwardPoint(note.pos.slice(0, 2) as Point)
        if (screened[0] < 0 || screened[0] > 1 || screened[1] < 0 || screened[1] > 1)
            return null
        let left = size * screened[0] - IndicatorSize / 2
        let top = size * (1 - screened[1]) - IndicatorSize / 2
        return [left, top]
    }
}

const { Plugin: NotesPlugin, Component } = PluginCreator(NotesController, NotesModel, 'NotesPlugin')
export default NotesPlugin
export type INotesPlugin = typeof NotesPlugin.Type

const IndicatorSize = 8

const styles = (theme: Theme) => createStyles({
    indicator: {
        position: 'absolute',
        border: '2px solid #ffffff',
        borderRadius: '50%',
        msFilter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=60)',
        filter: 'alpha(opacity = 60)',
        opacity: 0.6,
        webkitBoxShadow: '0 0 1px 0px rgb(255, 255, 255)',
        boxShadow: '0 0 1px 0px rgb(255, 255, 255)',
        width: IndicatorSize,
        height: IndicatorSize,
        zIndex: 86,
        backgroundColor: theme.palette.primary.main,
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

    return <div>
        {this.notes.map((note, index) => {
            let displayPos = this.displayPos(index)
            if (!displayPos)
                return null
            return <div ref={this.handleRef(note.id)} onClick={this.handleCollapse(index)} key={note.id} className={classes.indicator} style={{
                left: displayPos[0],
                top: displayPos[1],
            }} />
        })}
    </div>
}, styles)

const NotesPopers = Component(function NotesPopers (props, classes) {
    return <div>
        {this.notes.map((note, index) => {
            let displayPos = this.displayPos(index)
            if (!displayPos)
                return null
            return <div key={`${note.id}${displayPos}`} > <Popper referenceElement={this.ref(note.id)}>
                {({ ref, style, placement, arrowProps }) => (
                    <div ref={ref} style={style} data-placement={placement}>
                        Popper element
                        <div ref={arrowProps.ref} style={arrowProps.style} />
                    </div>
                )}
            </Popper></div>
        })}
    </div>
}, styles)
