const OPERATORS = [...'ABCDEF']
/**
 * Custom function to mix noise and attractor value
 * @param {number} a attractor angle
 * @param {number} b noise angle
 * @param {number} c particle index
 */
const DOMAIN = 75
const operate = (type, a, b, c) => {
    let x, y, d
    if (['C', 'D', 'E'].includes(type)) {
        y = c % DOMAIN
        x = c - y
        d = Math.hypot(
            Math.abs(x - DOMAIN / 2) / DOMAIN,
            Math.abs(y - DOMAIN / 2) / DOMAIN
        )
    }
    switch (type) {
        case 'A':
            return a % b
        case 'B':
            return (1 + a) ** 2 % Math.sin(b)
        case 'C':
            return (a % ((d / DOMAIN) * b)) * 1.25
        case 'D':
            return (a * Math.atan(d * 0.1)) ^ b
        case 'E':
            return a - Math.max(d / DOMAIN, b)
        case 'F':
            return a
    }
}

export { OPERATORS, operate }
