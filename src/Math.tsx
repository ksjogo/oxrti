export type Point = [number, number]

export const DummyRenderSize = 300

export function normalize (nums: number[]) {
    let length = 0
    for (let num of nums)
        length += num * num
    return nums.map(num => num / length)
}

export function rotate (nums: Point, rad: number) {
    return [
        nums[0] * Math.cos(rad) + nums[1] * -Math.sin(rad),
        nums[0] * Math.sin(rad) + nums[1] * Math.cos(rad),
    ] as Point
}

export function toTex (nums: Point): Point {
    return nums.map(x => x / 2 + 0.5) as Point
}

export function fromTex (nums: Point): Point {
    return nums.map(x => x * 2 - 1) as Point
}

export function translate (point: Point, by: Point): Point {
    return [point[0] + by[0], point[1] + by[1]]
}

import ndarray from 'ndarray'
import PNGWriter from './Plugins/ConverterPlugin/PNGWriter'

export async function Node2PNG (paintNode: any, width: number, height: number, canvas = document.createElement('canvas')): Promise<Blob> {
    const captured = paintNode.capture() as ndarray
    const writer = new PNGWriter({
        width: width,
        height: height,
        data: Buffer.from(captured.data as Uint8Array),
        elementSize: 32,
    })
    return Promise.resolve(writer.encode())
}
