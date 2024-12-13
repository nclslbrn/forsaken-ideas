import { DOMAIN } from './state'

const OPERATORS = [ ...'ABCDEF']
/**
 * Custom function to mix noise and attractor value
 * @param {number} a attractor angle
 * @param {number} b noise angle
 * @param {number} c particle index
 */
const { round, ceil, sin, cos, max, atan, PI, atan2, hypot } = Math
const operate = (type, a, b, c) => {
    let x, y, d
    if (['C', 'D', 'E', 'F'].includes(type)) {
        y = c % DOMAIN
        x = c - y
        d = hypot(x - DOMAIN / 2, y - DOMAIN / 2)
    }
    switch (type) {
        case 'A':
            return a % b
        case 'B':
            return (1 + a) ** 2 % sin(b)
        case 'C':
            return (a % ((d / DOMAIN) * b)) * 1.25
        case 'D':
            return (sin(a||0.03) * cos(d * 0.05)) ^ (b || 0.03)
        case 'E':
            return (1+a) - max(d / DOMAIN ** 2, b) * 0.15
        case 'F':
            const step1 = PI / 4,
                step2 = PI / 2
            return (round(x) ^ round(y)) % 9 !== 0
                ? ceil(a / step1) * step1 - ceil(b / step1) * step1
                : ceil(a / step2) * step2 + ceil(b / step2) * step2
    }
}

export { OPERATORS, operate }
