const dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2],
    add = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]],
    sub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]],
    mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s],
    normalize = (v) => {
        const len = Math.sqrt(dot(v, v))
        return [v[0] / len, v[1] / len, v[2] / len]
    }

export { dot, add, sub, mul, normalize }
