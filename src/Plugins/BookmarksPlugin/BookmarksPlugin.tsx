import React, { ChangeEvent } from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { types } from 'mobx-state-tree'
import { List, ListItem, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, Theme, createStyles, Button, Popover, Card, CardContent, CardActions, Typography, TextField } from '@material-ui/core'
import uniqid from 'uniqid'
import TrashIcon from '@material-ui/icons/Delete'
import { Tooltip } from '../BasePlugin/BasePlugin'

const BookmarkModel = types.model({
    values: types.optional(
        types.map(types.array(types.union(types.string, types.number))), {},
    ),
    name: 'name me',
    id: '',
})

const BookmarksModel = Plugin.props({
    bookmarks: types.optional(types.array(BookmarkModel), []),
})

class BookmarksController extends shim(BookmarksModel, Plugin) {

    get hooks () {
        return {
            ViewerSide: {
                PaintControl: {
                    component: BookmarkUI,
                    priority: 23,
                },
            },
        }
    }

    @action
    addBookmark (e: any) {
        let vals: { [key: string]: any } = {}
        this.appState.hookForEach('Bookmarks', (hook) => {
            let values = hook.save()
            vals[hook.key] = values
        })
        let bookmark = BookmarkModel.create({
            id: uniqid(),
            values: vals,
        })
        this.bookmarks.push(bookmark)
    }

    @action
    setBookmarkName (index: number, name: string) {
        this.bookmarks[index].name = name
    }

    handleBookmarkName (index: number) {
        return (event: ChangeEvent<HTMLInputElement>) => {
            this.setBookmarkName(index, event.target.value)
        }
    }

    @action
    async deleteBookmark (index: number) {
        this.bookmarks.splice(index, 1)
    }

    handleDelete (index: number) {
        return (event: any) => {
            this.deleteBookmark(index)
        }
    }

    @action
    restore (index: number) {
        this.appState.hookForEach('Bookmarks', (hook) => {
            let bookmark = this.bookmarks[index]
            let values = bookmark.values.get(hook.key)
            hook.restore(values)
        })
    }

    handleRestore (index: number) {
        return (event: any) => {
            this.restore(index)
        }
    }
}

const { Plugin: BookmarksPlugin, Component } = PluginCreator(BookmarksController, BookmarksModel, 'BookmarksPlugin')
export default BookmarksPlugin
export type IBookmarksPlugin = typeof BookmarksPlugin.Type

const styles = (theme: Theme) => createStyles({
})

const BookmarkUI = Component(function BookmarkUI (props, classes) {
    return <Card style={{ width: '100%' }} >
        <CardContent>
            <List>
                {this.bookmarks.map((bookmark, index) => (
                    <Tooltip title='Restore this bookmark' key={bookmark.id}>
                        <ListItem
                            onClick={this.handleRestore(index)}
                            key={bookmark.id}
                            role={undefined}
                            dense
                            button
                        >
                            <Typography style={{
                                marginTop: 10,
                            }}>RES</Typography>
                            <ListItemSecondaryAction>
                                <Tooltip title='Change name'>
                                    <TextField
                                        style={{
                                            maxWidth: 120,
                                        }}
                                        id='name'
                                        label=''
                                        value={bookmark.name}
                                        onChange={this.handleBookmarkName(index)}
                                        margin='normal'
                                    />
                                </Tooltip>
                                <Tooltip title='Delete'>
                                    <IconButton aria-label='Trash' onClick={this.handleDelete(index)} >
                                        <TrashIcon />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>

                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </CardContent>
        <CardActions>
            <Tooltip title='Store the current configuration inside a new bookmark'>
                <Button onClick={this.addBookmark}>Add Bookmark</Button>
            </Tooltip>
        </CardActions>
    </Card>
}, styles)
