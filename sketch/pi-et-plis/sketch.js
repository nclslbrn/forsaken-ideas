import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import { getLineLineCollision } from './trigonometry'
import Part from './Part'

let margin, parts, tileSize, button
const parentElem = document.getElementById('windowFrame')
const svg = new SvgTracer({
    parentElem: parentElem,
    size: 'A3_portrait'
})
const N = 2
const sketch = {
    iterations: 100,
    nIter: 0,

    // setup
    launch: () => {
        svg.init()
        margin = svg.cmToPixels(3)
        tileSize = [
            Math.round((svg.width - margin * 2) / N),
            Math.round((svg.height - margin * 2) / N)
        ]
        button = document.createElement('button')
        button.innerText = 'Add fold'
        button.addEventListener(
            'click',
            () => {
                sketch.cutTile()
                sketch.drawTiles()
            },
            false
        )
        parentElem.appendChild(button)
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
                        (x + y) % 2 === 0
                            ? ['black', 'white']
                            : ['white', 'black']
                    )
                )
            }
        }

        let i = 0
        while (i < 10) {
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
                newParts.push(new Part(a, [part.color[1], part.color[0]]))
                newParts.push(new Part(b, [part.color[0], part.color[1]]))
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
        parts.forEach((p) => {
            svg.path({
                points: p.points,
                fill: p.color[0],
                stroke: p.color[1],
                close: true
            })
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
