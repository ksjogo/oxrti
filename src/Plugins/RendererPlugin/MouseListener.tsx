import { Point } from '../../Util'

export type MouseListener = (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point, dragging: boolean) => boolean
