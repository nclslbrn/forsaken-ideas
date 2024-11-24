const OPERATORS = [...'ABCDE']
/**
 * Custom function to mix noise and attractor value
 * @param {number} a attractor angle
 * @param {number} b noise angle
 * @param {number} c particle index
 */
const operate = (type, a, b, c) => {
    let x, y, d
    if (['D', 'E'].includes(type)) {
        y = c % 100
        x = c - y
        d = (Math.abs(x - 50) % 50) * (Math.abs(y - 50) % 50)
    }
    switch (type) {
        case 'A':
            return a % b
        case 'B':
            return (c % 75)/75 + (a * Math.sin(b)) ^ a 
        case 'C':
            return (a % ((c % b) + b)) * 0.1
        case 'D':
            return a * Math.atan(d * 0.1) ^ b
        case 'E':
            const dNorm = (37.5 - d) / 75
            return Math.sin(a * dNorm) + b
    }
}

export { OPERATORS, operate }
