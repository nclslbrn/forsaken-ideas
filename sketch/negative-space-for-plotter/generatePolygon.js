import { polygon, line } from '@thi.ng/geom'
import { createNoise2D } from 'simplex-noise'
import { SYSTEM } from '@thi.ng/random'

const polyFromTopAndBottom = (top, bottom, ground, colors, cID) => {
    return polygon(
        [
            ...top.map((p) => [p[0], p[1] - ground / 2]),
            ...bottom.reverse().map((p) => [p[0], p[1] + ground / 2])
        ],
        {
            fill: colors[cID % colors.length]
        }
    )
}
const rectFromTopAndBottom = (top, bottom, ground, colors, cID) => {
    const minY = Math.min(top[0][1], top[top.length - 1][1]) - ground * 2
    const straightTop = [top[0], top[top.length - 1]].map((p) => [p[0], minY])
    const maxY = Math.max(top[0][1], top[top.length - 1][1]) + ground * 2
    const straightBottom = [bottom[0], bottom[bottom.length - 1]].map((p) => [
        p[0],
        maxY
    ])
    const attribs = { fill: colors[cID % colors.length] }

    return [
        polygon(
            [
                ...straightTop.reverse(),
                ...top.map((p) => [p[0], p[1] - ground / 2])
            ],
            attribs
        ),
        polygon(
            [
                ...straightBottom.reverse(),
                ...bottom.map((p) => [p[0], p[1] + ground / 2])
            ],
            attribs
        )
    ]
}
const lineFromTopAndBottom = (top, bottom, ground) => {
    if (top[1] < bottom[1]) {
        top[1] -= ground / 2
        bottom[1] += ground / 2
    } else {
        top[1] += ground / 2
        bottom[1] -= ground / 2
    }
    return line(top, bottom)
}

const generatePolygon = (
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
        lines = [],
        noise2D = createNoise2D()

    let drawWithLine = false
    for (let y = margin[1] + step; y < height - margin[1]; y += step) {
        let top = [],
            bottom = [],
            splitPerLine = 0
        const res = SYSTEM.minmaxInt(4, 8) / 2
        for (let x = margin[0]; x < width - margin[0]; x += res) {
            const n1 = noise2D(
                (x / width) * step * scale,
                step * decay * scale * 5
            )
            const n2 = noise2D(
                (y / height) * step * scale,
                step * decay * scale * 5
            )
            const p1 = [x, y + Math.min(step / 4, n1 * step * 0.5)]
            const p2 = [x, y + Math.min(step / 4, n2 * step * 0.5)]

            if (drawWithLine) {
                lines.push(lineFromTopAndBottom(p1, p2, ground))
            } else {
                if (p1[1] < p2[1]) {
                    top.push(p1)
                    bottom.push(p2)
                } else {
                    top.push(p2)
                    bottom.push(p1)
                }
            }
            if (SYSTEM.float() > 0.9) {
                if (!drawWithLine) {
                    if (SYSTEM.float() > 0.5) {
                        polys.push(
                            polyFromTopAndBottom(
                                top,
                                bottom,
                                ground,
                                colors,
                                splitPerLine
                            )
                        )
                    } else {
                        polys.push(
                            ...rectFromTopAndBottom(
                                top,
                                bottom,
                                ground,
                                colors,
                                splitPerLine
                            )
                        )
                    }
                    top = []
                    bottom = []
                    x += res
                }
                drawWithLine = !drawWithLine
                splitPerLine++
            }
        }
        if (!drawWithLine) {
            polys.push(
                polyFromTopAndBottom(top, bottom, ground, colors, splitPerLine)
            )
        }
    }

    return [polys, lines]
}

export { generatePolygon }
