import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import { getLineLineCollision } from './trigonometry'
import isPointInsidePolygon from './isPointInsidePolygon'
import Part from './Part'

let margin, parts, tileSize
const svg = new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'A3_portrait'
})
const N = 2,
    I = 10
const sketch = {
    // setup
    launch: () => {
        svg.init()
        margin = svg.cmToPixels(3)
        tileSize = [
            Math.round((svg.width - margin * 2) / N),
            Math.round((svg.height - margin * 2) / N)
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
        const isVertical = Math.random() > 0.5
        const line = [
            [
                isVertical ? Math.round(Math.random() * svg.width) : margin / 2,
                isVertical ? margin / 2 : Math.round(Math.random() * svg.height)
            ],
            [
                isVertical
                    ? Math.round(Math.random() * svg.width)
                    : svg.width - margin / 2,
                isVertical
                    ? svg.height - margin / 2
                    : Math.round(Math.random() * svg.height)
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
        const lineStep = 10
        svg.clear()
        parts.forEach((p, i) => {
            const min = [
                Math.min(...p.points.map((pt) => pt[0])),
                Math.min(...p.points.map((pt) => pt[1]))
            ]
            const max = [
                Math.max(...p.points.map((pt) => pt[0])),
                Math.max(...p.points.map((pt) => pt[1]))
            ]
            const lines = []
            if (i % 2) {
                for (let x = min[0]; x <= max[0]; x += lineStep) {
                    lines.push([
                        [x, min[1]],
                        [x, max[1]]
                    ])
                }
            } else {
                for (let y = min[1]; y <= max[1]; y += lineStep) {
                    lines.push([
                        [min[0], y],
                        [max[0], y]
                    ])
                }
            }
            lines.forEach((l) => {
                const angle = Math.atan2(l[1][1] - l[0][1], l[1][0] - l[0][0])
                const size = Math.sqrt(
                    Math.abs(l[1][0] - l[0][0]) ** 2 +
                        Math.abs(l[1][1] - l[0][1]) ** 2
                )

                let lastPointInPoly = true
                const linePoly = []
                for (let d = 0; d <= size; d++) {
                    const pt = [
                        l[0][0] + d * Math.cos(angle),
                        l[0][1] + d * Math.sin(angle)
                    ]
                    const isPointInPoly = isPointInsidePolygon(pt, p.points)
                    if (isPointInPoly !== lastPointInPoly) {
                        linePoly.push(pt)
                        lastPointInPoly = isPointInPoly
                    }
                }
                if (linePoly.length > 0) {
                    svg.path({
                        points: linePoly,
                        stroke: p.index % 2 === 0 ? 'tomato' : 'steelblue',
                        close: false
                    })
                }
            })
            /*  svg.path({
                points: p.points,
                fill: p.index % 2 === 0 ? 'black' : 'white',
                stroke: p.index % 2 === 0 ? 'white' : 'black',
                close: true
            }) */
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
