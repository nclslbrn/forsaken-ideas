const OPERATORS = [...'ABCDE']

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
            return c % 2 === 0 ? b % a : (a + b) / 2
        case 'C':
            return (a % ((c % 10) + b)) * 0.05
        case 'D':
            return a * Math.atan(d * 0.1 * b)
        case 'E':
            const dNorm = (71 - d) / 70
            return Math.sin(a * dNorm)
    }
}

export { OPERATORS, operate }
