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

export function Node2PNG (paintNode: any, width: number, height: number, flipY = false): Blob {
    let captured = paintNode.capture() as ndarray
    let data = captured.data as Uint8Array
    if (flipY)
        data = flip(data, width, height)
    let writer = new PNGWriter({
        width: width,
        height: height,
        data: Buffer.from(data),
        elementSize: 32,
    })
    return writer.encode()
}

function flip (data: Uint8Array, width: number, height: number): Uint8Array {
    for (let y = 0; y < Math.floor(height / 2); ++y) {
        for (let x = 0; x < width; ++x) {
            let originalIndex = ((y * width) + x) * 4
            let flippedIndex = (((height - 1 - y) * width) + x) * 4
            for (let b = 0; b <= 3; b++) {
                let a = data[originalIndex + b]
                data[originalIndex + b] = data[flippedIndex + b]
                data[flippedIndex + b] = a
            }
        }
    }

    return data
}