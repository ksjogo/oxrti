export function normalize (nums: number[]) {
    let length = 0
    for (let num of nums)
        length += num * num
    return nums.map(num => num / length)
}

export function rotate (nums: number[], rad: number) {
    return [
        nums[0] * Math.cos(rad) + nums[1] * -Math.sin(rad),
        nums[0] * Math.sin(rad) + nums[1] * Math.cos(rad),
    ]
}

export function toTex (nums: number[] | number) {
    if (typeof nums === 'number')
        return nums / 2 + 0.5
    else
        return nums.map(x => x / 2 + 0.5)
}
