const OPERATORS = [...'ABCDEF']
/**
 * Custom function to mix noise and attractor value
 * @param {number} a attractor angle
 * @param {number} b noise angle
 * @param {number} c particle index
 */
const { abs, ceil, sin, cos, max, atan, PI, atan2, hypot } = Math
const DOMAIN = 75
const operate = (type, a, b, c) => {
    let x, y, d
    if (['C', 'D', 'E', 'F'].includes(type)) {
        y = c % DOMAIN
        x = c - y
        d = hypot(abs(x - DOMAIN / 2) / DOMAIN, abs(y - DOMAIN / 2) / DOMAIN)
    }
    switch (type) {
        case 'A':
            return a % b
        case 'B':
            return (1 + a) ** 2 % sin(b)
        case 'C':
            return (a % ((d / DOMAIN) * b)) * 1.25
        case 'D':
            return (a * atan(d * 0.1)) ^ b
        case 'E':
            return a - max(d / DOMAIN, b)
        case 'F':
            const step1 = PI / 4, step2 = PI / 2 
            return (x ^ y) % 15 !== 0
                ? (ceil(a / step1) * step1)
                : (ceil(a / step2) * step2) + b/2
    }
}

export { OPERATORS, operate }
