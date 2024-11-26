const OPERATORS = [...'ABCDE']
/**
 * Custom function to mix noise and attractor value
 * @param {number} a attractor angle
 * @param {number} b noise angle
 * @param {number} c particle index
 */
const DOMAIN = 75
const operate = (type, a, b, c) => {
    let x, y, d
    if (['B', 'D', 'E'].includes(type)) {
        y = c % DOMAIN
        x = c - y
        d = Math.hypot(
            (Math.abs(x - DOMAIN / 2) % DOMAIN) / 2,
            (Math.abs(y - DOMAIN / 2) % DOMAIN) / 2
        )
    }
    switch (type) {
        case 'A':
            return a % b
        case 'B':
            return Math.sinh(a) % Math.sin(c % b)
        case 'C':
            return (a % ((c % b) + b)) * 0.1
        case 'D':
            return (a * Math.atan(d * 0.1)) ^ b
        case 'E':
            const dNorm = (37.5 - d) / 75
            return Math.sin(a * dNorm) + b
    }
}

export { OPERATORS, operate }
