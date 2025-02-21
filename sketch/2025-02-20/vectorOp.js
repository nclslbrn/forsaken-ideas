const { cos, sin, sqrt } = Math

// Vector operations
const vec3 = {
        add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
        sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
        mul: (v, s) => [v[0] * s, v[1] * s, v[2] * s],
        length: (v) => sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]),
        normalize: (v) => {
            const len = vec3.length(v)
            return [v[0] / len, v[1] / len, v[2] / len]
        }
    },
    rotateX = (p, angle) => {
        const c = cos(angle)
        const s = sin(angle)
        return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
    },
    rotateY = (p, angle) => {
        const c = cos(angle)
        const s = sin(angle)
        return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
    },
    rotateZ = (p, angle) => {
        const c = cos(angle)
        const s = sin(angle)
        return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]
    }

export { vec3, rotateX, rotateY, rotateZ }
