import React from 'react'
import Plugin, { PluginCreator } from '../../Plugin'
import { shim, action } from 'classy-mst'
import { Node, Shaders } from 'gl-react'
import { types } from 'mobx-state-tree'
import { List, ListItem, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, Theme, createStyles, Button, Popover, Card, CardContent, CardActions, Typography } from '@material-ui/core'
import uniqid from 'uniqid'
import { RIEInput } from '@attently/riek'
import TrashIcon from '@material-ui/icons/Delete'

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
    addBookmark (e) {
        let vals = {}
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
    setBookmarkName (index, name) {
        this.bookmarks[index].name = name
    }

    handleBookmarkName (index) {
        return (change) => {
            this.setBookmarkName(index, change.name)
        }
    }

    @action
    async deleteBookmark (index: number) {
        this.bookmarks.splice(index, 1)
    }

    handleDelete (index) {
        return (event) => {
            this.deleteBookmark(index)
        }
    }

    @action
    restore (index) {
        this.appState.hookForEach('Bookmarks', (hook) => {
            let bookmark = this.bookmarks[index]
            let values = bookmark.values.get(hook.key)
            hook.restore(values)
        })
    }

    handleRestore (index) {
        return (event) => {
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
                    <ListItem
                        onClick={this.handleRestore(index)}
                        key={bookmark.id}
                        role={undefined}
                        dense
                        button
                    >
                        <ListItemText>
                            <RIEInput
                                value={bookmark.name}
                                change={this.handleBookmarkName(index)}
                                propName='name' />
                        </ListItemText>
                        <ListItemSecondaryAction>
                            <IconButton aria-label='Trash' onClick={this.handleDelete(index)} >
                                <TrashIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </CardContent>
        <CardActions>
            <Button onClick={this.addBookmark}>Add Bookmark</Button>
        </CardActions>
    </Card>
}, styles)
