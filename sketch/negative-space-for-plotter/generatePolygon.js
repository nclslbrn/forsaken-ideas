import { polygon } from '@thi.ng/geom'
import { isInOneRect } from './inRect'
import { createNoise2D } from 'simplex-noise'
import { map } from '../../sketch-common/Math'

const generatePolygon = (
    rects,
    step,
    scale,
    ground,
    margin,
    decay,
    width,
    height,
    colors
) => {
    const polys = [],
        noise2D = createNoise2D()

    let wasInRect = false,
        yID = 0

    for (let y = margin; y < height - margin; y += step) {
        let top = [],
            bottom = []

        for (let x = margin; x < width - margin; x += 3) {
            const n1 = noise2D((x / height) * step * scale, decay)
            const n2 = noise2D((y / height) * step * scale, decay)
            const p1 = [x, y + Math.min(step / 4, n1 * step * 0.25)]
            const p2 = [x, y + Math.min(step / 4, n2 * step * 0.25)]

            if (isInOneRect(p1, rects) && isInOneRect(p2, rects)) {
                if (p1[1] < p2[1]) {
                    top.push(p1)
                    bottom.push(p2)
                } else {
                    top.push(p2)
                    bottom.push(p1)
                }
                wasInRect = true
            } else {
                if (wasInRect) {
                    polys.push(
                        polygon(
                            [
                                ...top.map((p) => [p[0], p[1] - ground / 2]),
                                ...bottom
                                    .reverse()
                                    .map((p) => [p[0], p[1] + ground / 2])
                            ],
                            {
                                fill: colors[yID % colors.length],
                                stroke: '#333'
                            }
                        )
                    )
                    top = []
                    bottom = []
                }
                wasInRect = false
            }
        }
        polys.push(
            polygon(
                [
                    ...top.map((p) => [p[0], p[1] - ground / 2]),
                    ...bottom.reverse().map((p) => [p[0], p[1] + ground / 2])
                ],
                {
                    fill: colors[yID % colors.length],
                    stroke: '#333'
                }
            )
        )
        yID++
    }

    return polys
}

export { generatePolygon }
