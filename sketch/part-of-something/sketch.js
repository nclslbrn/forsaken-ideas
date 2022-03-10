import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import SimplexNoise from 'simplex-noise'
import { getLineLineCollision } from './trigonometry'
import isPointInsidePolygon from './isPointInsidePolygon'
import Part from './Part'
import {
    random,
    ceil,
    abs,
    sqrt,
    cos,
    sin,
    atan2,
    round,
    min,
    max,
    PI
} from '../../src/js/sketch-common/Math'

let margin, parts, tileSize
const svg = new SvgTracer({
        parentElem: document.getElementById('windowFrame'),
        size: 'A3_Square',
        dpi: 72
    }),
    simplex = new SimplexNoise(),
    N = ceil(random() * 3),
    I = 25,
    noiseLine = (line) => {
        const noisedLine = []
        const freq = 0.003
        const turbulence = 15
        const force = 2
        line.forEach((pt) => {
            const nValue =
                turbulence * simplex.noise2D(pt[0] * freq, pt[1] * freq)
            noisedLine.push([
                pt[0] + cos(nValue) * force,
                pt[1] + sin(nValue) * force
            ])
        })
        return noisedLine
    }

const sketch = {
    // setup
    launch: () => {
        svg.init()
        svg.elem.style.maxWidth = 'unset'
        svg.elem.style.maxHeight = 'unset'
        margin = svg.cmToPixels(3)
        tileSize = [
            round((svg.width - margin * 2) / N),
            round((svg.height - margin * 2) / N)
        ]
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clear()
        parts = []
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                parts.push(
                    new Part(
                        [
                            [
                                margin + x * tileSize[0],
                                margin + y * tileSize[1]
                            ],
                            [
                                margin + (x + 1) * tileSize[0],
                                margin + y * tileSize[1]
                            ],
                            [
                                margin + (x + 1) * tileSize[0],
                                margin + (y + 1) * tileSize[1]
                            ],
                            [
                                margin + x * tileSize[0],
                                margin + (y + 1) * tileSize[1]
                            ]
                        ],
                        (x + y) % 2
                    )
                )
            }
        }
        let i = 0
        while (i < I) {
            sketch.cutTile()
            i++
        }
        sketch.drawTiles()
    },
    cutTile: () => {
        const isVertical = random() > 0.5
        const line = [
            [
                isVertical ? round(random() * svg.width) : margin / 2,
                isVertical ? margin / 2 : round(random() * svg.height)
            ],
            [
                isVertical
                    ? round(random() * svg.width)
                    : svg.width - margin / 2,
                isVertical
                    ? svg.height - margin / 2
                    : round(random() * svg.height)
            ]
        ]

        let newParts = []
        let partsToRemove = []
        parts.forEach((part, h) => {
            let split = []
            let intersect = [undefined, undefined]
            part.points.forEach((pt, i, points) => {
                const nPt = getLineLineCollision(
                    pt,
                    points[i < points.length - 1 ? i + 1 : 0],
                    line[0],
                    line[1]
                )
                if (nPt) {
                    // first collision
                    if (undefined == intersect[0]) {
                        split.push(nPt)
                        intersect[0] = i

                        // second collision
                    } else {
                        split.push(nPt)
                        intersect[1] = i
                    }
                }
            })
            if (split.length >= 2) {
                const a = [],
                    b = []
                part.points.forEach((pt, i) => {
                    if (i <= intersect[0]) a.push(pt)
                    if (i === intersect[0] + 1) {
                        a.push(split[0])
                        b.push(split[0])
                    }
                    if (i > intersect[0] && i <= intersect[1]) b.push(pt)
                    if (i === intersect[1]) {
                        b.push(split[1])
                        a.push(split[1])
                    }
                    if (i > intersect[1]) {
                        a.push(pt)
                    }
                })
                newParts.push(new Part(a, part.index + 1))
                newParts.push(new Part(b, part.index + 2))
                partsToRemove.push(h)
            }
        })
        if (undefined !== newParts[0] && undefined !== partsToRemove[0]) {
            const nextParts = parts.filter((part, i) => {
                return !partsToRemove.includes(i)
            })
            newParts.forEach((p) => nextParts.push(p))
            parts = nextParts
            svg.clear()
            sketch.drawTiles()
        }
    },
    drawTiles: () => {
        svg.clear()
        parts.forEach((p, i) => {
            const center = [
                svg.width / 2 + (random() - 0.5) * svg.cmToPixels(5),
                svg.height / 2 + (random() - 0.5) * svg.cmToPixels(5)
            ]

            const radiuses = p.points.map((p) =>
                abs(sqrt((center[0] - p[0]) ** 2 + (center[1] - p[1]) ** 2))
            )
            const angles = p.points.map((p) =>
                atan2(p[1] - center[1], p[0] - center[0])
            )
            const minRadius = min(...radiuses)
            const maxRadius = max(...radiuses)
            const minAngle = min(...angles) - 1
            const maxAngle = max(...angles) + 1

            let pointByCircle = 10
            for (
                let radius = minRadius;
                radius <= maxRadius;
                radius += svg.cmToPixels(0.15)
            ) {
                const arc = []
                //const start = random() * PI * 2
                for (
                    let theta = minAngle;
                    theta <= maxAngle;
                    theta += (PI * 2) / pointByCircle
                ) {
                    const arcP = [
                        center[0] + cos(theta) * radius,
                        center[1] + sin(theta) * radius
                    ]
                    if (isPointInsidePolygon(arcP, p.points)) {
                        arc.push([...arcP])
                    }
                }
                if (arc.length > 1) {
                    svg.path({
                        points: arc,
                        stroke: 'black',
                        fill: 'none',
                        close: false
                    })
                }

                pointByCircle += 75
            }
            /*  svg.path({
                points: p.points,
                stroke: 'black',
                fill: 'none',
                close: false
            }) */
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'part-of-something' })
    }
}

export default sketch
