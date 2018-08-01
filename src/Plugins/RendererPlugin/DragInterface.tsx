import { Point } from '../../Math'

export type Dragger = (oldTex: Point, nextTex: Point, oldScreen: Point, nextScreen: Point) => boolean
