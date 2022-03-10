/**
 * Math js function wrapper
 */

const sin = Math.sin
const cos = Math.cos
const atan2 = Math.atan2
const PI = Math.PI
const TAU = Math.PI * 2
const sqrt = Math.sqrt
const abs = Math.abs
const min = Math.min
const max = Math.max
const floor = Math.floor
const ceil = Math.ceil
const round = Math.round
const random = Math.random
const map = (n, start1, stop1, start2, stop2) => {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}
export {
    sin,
    cos,
    atan2,
    PI,
    TAU,
    sqrt,
    abs,
    min,
    max,
    floor,
    ceil,
    round,
    random,
    map
}
