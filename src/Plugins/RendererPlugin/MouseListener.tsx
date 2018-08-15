import { Point } from '../../Math'

export type MouseListener = (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point, dragging: boolean) => boolean
