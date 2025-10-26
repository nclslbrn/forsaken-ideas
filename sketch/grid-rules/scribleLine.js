const { atan2, ceil, hypot, cos, sin, round, PI } = Math

import { createNoise2D } from 'simplex-noise'

const noise = createNoise2D()

const scribleLine = (line, step = 1, intensity = 0.025) => {
    const scrible = []
    if (line.length === 0) return []
    for (let i = 0; i < line.length - 1; i++) {
        const direction = atan2(
            line[i + 1][1] - line[i][1],
            line[i + 1][0] - line[i][0]
        )
        const lineSize = ceil(
            hypot(line[i + 1][0] - line[i][0], line[i + 1][1] - line[i][1])
        )
        for (let j = 0; j <= lineSize; j += step) {
            //const nR = (j / s) * PI * 2
            const lnPnt = [
                line[i][0] + cos(direction) * j,
                line[i][1] + sin(direction) * j
            ]
            const n = noise(...lnPnt.map((d) => d * 0.03)) * intensity
            scrible.push([lnPnt[0] + cos(n), lnPnt[1] + sin(n)])
        }
    }
    return scrible
}

export { scribleLine }
