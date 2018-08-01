import { Point } from '../../Math'

export type Dragger = (old: Point, next: Point) => boolean
