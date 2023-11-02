import { polyline, polygon, line } from '@thi.ng/geom'
import { createNoise2D } from 'simplex-noise'
import { SYSTEM } from '@thi.ng/random'


const noisedLine = (step, scale, ground, margin, decay, width, height) => {
    const noise2D = createNoise2D(), bands = []
    for (let y = margin[1] + step; y < height - margin[1]; y += step) {
        let top = [],
            bottom = []

        for (let x = margin[0]; x < width - margin[0]; x++) {
            const n1 = noise2D(
                (x / width) * step * scale,
                step * scale * 5
            )
            const n2 = noise2D(
                (y / height) * step * scale,
                (step * scale) // + (x * scale * 0.003)
            )
            const y1 = y + Math.min(step / 4, n1 * step * 0.5)
            const y2 = y + Math.min(step / 4, n2 * step * 0.5)

            if (y1 >= y2) {
                top.push([x, y2 - ground / 2])
                bottom.push([x, y1 + ground / 2])
            } else {
                top.push([x, y1 - ground / 2])
                bottom.push([x, y2 + ground / 2])
            }
        }
        bands.push([top, bottom])
    }
    return bands
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

    const bands = noisedLine(step, scale, ground, margin, decay, width, height)
    const lines = [], polygons = []
    const interbands = []

    for (let i = 0; i <= bands.length; i++) {
        if (i < bands.length) {
            let [top, bottom] = bands[i]
            const minY = Math.min(...top.map(v => v[1])) - ground / 2
            const maxY = Math.max(...bottom.map(v => v[1])) + ground / 2
            const interband = [
                top.map(v => [v[0], minY]),
                bottom.map(v => [v[0], maxY])
            ]
            let drawWithLine = false
            let polyTop = [], polyBottom = [], splitPerLine = 0

            for (let j = 0; j < Math.min(top.length, bottom.length); j++) {
                // Draw or store point
                if (drawWithLine) {
                    if (j % 4 === 0) {
                        lines.push(line(top[j], bottom[j]))
                    }
                } else {
                    polyTop.push(top[j])
                    polyBottom.push(bottom[j])
                }

                // Then decide future shape
                if (SYSTEM.float() > 0.9) {
                    if (!drawWithLine) {
                        const attribs = { fill: colors[splitPerLine % colors.length] }
                        // Draw solid shape
                        if (SYSTEM.float() > 0.5) {
                            polygons.push(polygon(
                                [
                                    ...polyTop.reverse(), ...polyBottom
                                ],
                                attribs
                            ))
                        }
                        // Draw negatively top and bottom 
                        else {
                            const boxMinY = Math.min(...polyTop.map(v => v[1]))
                            const boxMaxY = Math.max(...polyTop.map(v => v[1])) + ground * 2

                            polygons.push(polygon(
                                [
                                    ...polyTop,
                                    ...polyTop.map((v) => [v[0], boxMinY]).reverse()
                                ],
                                attribs
                            ))

                            polygons.push(polygon(
                                [
                                    ...polyBottom.map((v) => [v[0], boxMaxY]).reverse(),
                                    ...polyBottom
                                ],
                                attribs
                            ))

                            // Then replace top and bottom 
                            for (let r = 0; r < Math.min(polyTop.length, polyBottom.length); r++) {
                                // top
                                top[j - r] = [top[j - r][0], boxMinY]

                                // bottom
                                bottom[j - r] = [bottom[j - r][0], Math.max(bottom[j - r][1], boxMaxY)]

                                interband[0][j - r] = [top[j - r][0], boxMinY - ground]
                                interband[1][j - r] = [bottom[j - r][0], Math.max(boxMaxY, bottom[j - r][1]) + 1]

                            }
                        }
                        polyTop = []
                        polyBottom = []
                    }
                    drawWithLine = !drawWithLine
                    splitPerLine++
                }
            }
            if (polyTop.length > 0 && polyBottom.length > 0) {
                polygons.push(polygon(
                    [
                        ...polyTop.reverse(), ...polyBottom
                    ],
                    { fill: colors[splitPerLine % colors.length] }
                ))

            }

            lines.push(polyline(
                top.map(p => [p[0], p[1] - 2]),
            ))
            lines.push(polyline(
                bottom.map(p => [p[0], p[1] + 2]),
                //{ fill: 'rgba(0, 0, 0, 0)})' }
            ))
            bands[i] = [top, bottom]
            interbands.push(interband)
        }

        const prevBottom = i === 0
            ? interbands[i][1].map(v => [v[0], margin[1]])
            : interbands[i - 1][1]

        const currTop = i < interbands.length
            ? interbands[i][0]
            : interbands[i - 1][0].map(v => [v[0], height - (margin[1] - ground * 2)])


        for (let k = 0; k < Math.min(prevBottom.length, currTop.length); k += 4) {
            lines.push(line(prevBottom[k], currTop[k]))
        }
    }
    return [polygons, lines]
}
/*
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
        bands = [],
        noise2D = createNoise2D()

    let drawWithLine = false,
        drawNegative = false

    for (let y = margin[1] + step; y < height - margin[1]; y += step) {
        let top = [],
            bottom = [],
            splitPerLine = 0
        const res = 3 //SYSTEM.minmaxInt(4, 8) / 2
        const band = [
            [], // bottom
            [] // top
        ]

        for (let x = margin[0]; x < width - margin[0]; x += res) {
            const n1 = noise2D(
                (x / width) * step * scale,
                step * decay * scale * 5
            )
            const n2 = noise2D(
                (y / height) * step * scale,
                step * decay * scale * 100
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
            if (top.length === 0 && bottom.length === 0) {
                if (p1[1] >= p2[1]) {
                    band[0].push([x, p1[1]])
                    band[1].push([x, p2[1]])
                } else {
                    band[0].push([x, p2[1]])
                    band[1].push([x, p1[1]])
                }
            } else {
                band[0].push([x, bottom[bottom.length - 1][1] + ground])
                band[1].push([x, top[top.length - 1][1] - ground])
            }
        }
        bands.push(band)

        if (!drawWithLine) {
            polys.push(
                polyFromTopAndBottom(top, bottom, ground, colors, splitPerLine)
            )
        }
    }
    bands.forEach((b) => {
        lines.push(polyline(b[0]))
        lines.push(polyline(b[1]))
    })

    return [polys, lines]
}
*/
export { generatePolygon }
