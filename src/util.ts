export function sleep (ms) {
    return new Promise(res => setTimeout(res, ms))
}

export function JSONY (thing) {
    return JSON.stringify(thing, null, 2)
}