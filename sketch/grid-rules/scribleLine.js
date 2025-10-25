const { atan2, ceil, hypot, cos, sin, round, PI } = Math

import { createNoise2D } from 'simplex-noise'

const noise = createNoise2D()

const scribleLine = (line, step = 1, intensity = 0.025) => {
    const scrible = []
    if (line.length === 0) return []
    for (let i = 0; i < line.length - 1; i++) {
        const l = atan2(
            line[i + 1][1] - line[i][1],
            line[i + 1][0] - line[i][0]
        )
        const s = ceil(
            hypot(line[i + 1][0] - line[i][0], line[i + 1][1] - line[i][1])
        )
        for (let j = 0; j <= s; j += step) {
            //const nR = (j / s) * PI * 2
            const n = noise(line[i][0] * 0.03, line[i][1] * 0.03) * intensity
            scrible.push([
                round(line[i][0] + cos(l + n) * j * n),
                round(line[i][1] + sin(l + n) * j * n)
            ])
        }
    }
    return scrible
}

export { scribleLine }
