export function normalize (nums: number[]) {
    let length = 0
    for (let num of nums)
        length += num * num
    return nums.map(num => num / length)
}
