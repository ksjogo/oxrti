export function sleep (ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

export function JSONY (thing: object) {
    return JSON.stringify(thing, null, 2)
}