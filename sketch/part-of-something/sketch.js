import SvgTracer from '../../sketch-common/svg-tracer'
import { getLineLineCollision } from './trigonometry'
import isPointInsidePolygon from './isPointInsidePolygon'
import Notification from '../../sketch-common/Notification'
import Part from './Part'
import {
    random,
    randBetween,
    floor,
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
} from '../../sketch-common/Math'

let margin, parts, tileSize, colors
const container = document.getElementById('windowFrame'),
    svg = new SvgTracer({
        parentElem: container,
        size: {w: 40, h: 40},
        background: '#000',
    }),
    N = ceil(random() * 3),
    I = 64

const sketch = {
    // setup
    launch: () => {
        svg.init()
        margin = svg.cmToPixels(1)
        tileSize = [
            round((svg.width - margin * 2) / N),
            round((svg.height - margin * 2) / N)
        ]
        const accent = ['yellow', 'orange', 'purple',  'tomato', 'steelblue']
        colors = ['black', '#ffff33', '#33ffff', '#ff33ff', 'white', accent[floor(random() * accent.length)]]
        colors.forEach((color) =>
            svg.group({
                name: color,
                id: color,
                stroke: color,
                strokeWidth: 2
            })
        )
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clearGroups()
        svg.rect({
            x: 0,
            y: 0,
            w: svg.width,
            h: svg.height,
            fill: 'black',
            stroke: 'black',
            group: 'black'
        })
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
        new Notification('Sketch done.', container, 'light')
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
        }
    },
    drawTiles: () => {
        parts.forEach((p, i) => {
            const drawMode = floor(random() * 3)
            const center = [
                svg.width / 2 + (random() - 0.5) * svg.cmToPixels(0.92),
                svg.height / 2 + (random() - 0.5) * svg.cmToPixels(0.08)
            ]
            const radiuses = p.points.map((p) =>
                sqrt(abs(center[0] - p[0]) ** 2 + abs(center[1] - p[1]) ** 2)
            )
            const angles = p.points.map((p) =>
                atan2(p[1] - center[1], p[0] - center[0])
            )
            const maxRadius = max(...radiuses)
            let minAngle = min(...angles)
            let maxAngle = max(...angles)
            const radiusStep = svg.cmToPixels(randBetween(0.1, 0.7))
            // only for dashed line
            const gapIndex = 2 + round(random() * 10)
            // Ugly hack to loop between -PI & PI
            if (minAngle <= -PI / 2 && maxAngle >= PI / 2) {
                minAngle = 0
                maxAngle = PI * 2.001
            }
            let pointByCircle = 12
            for (let radius = 0; radius <= maxRadius; radius += radiusStep) {
                const angleStep = (PI * 2) / pointByCircle
                const arcs = []
                let arc = false
                for (
                    let theta = minAngle;
                    theta <= maxAngle;
                    theta += angleStep
                ) {
                    const arcP = [
                        center[0] + cos(theta) * radius,
                        center[1] + sin(theta) * radius
                    ]

                    if (isPointInsidePolygon(arcP, p.points)) {
                        if (arc) {
                            arc.push([...arcP])
                        } else {
                            arc = [[...arcP]]
                        }
                    } else {
                        if (arc) {
                            arcs.push([...arc])
                            arc = false
                        } else {
                            arc = false
                        }
                    }
                }
                if (arc) arcs.push([...arc])
                arcs.forEach((arc) => {
                    if (arc.length > 1) {
                        switch (drawMode) {
                            case 0:
                                // blank
                                break
                            case 1:
                                // full line
                                svg.path({
                                    points: arc,
                                    stroke: colors[(i % 4) + 1],
                                    fill: 'none',
                                    close: false,
                                    group: colors[(i % 4) + 1]
                                })
                                break
                            case 2:
                                // eslint-disable-next-line no-case-declarations
                                const dashed = arc.reduce((acc, curr, i) => {
                                    if (i % gapIndex) acc[acc.length - 1].push(curr)
                                    else acc.push([curr])
                                    return acc
                                },[])
                                
                                
                                dashed.forEach(line => {
                                    // if (d % 2 == 0) {
                                    svg.path({
                                        points: line,
                                        stroke: colors[(i % 4) + 1],
                                        fill: 'none',
                                        close: false,
                                        group: colors[(i % 4) + 1]
                                    })
                                    // }
                                })
                                break
                        }
                    }
                })
                pointByCircle += 4
            }
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'part-of-something' })
    }
}

export default sketch
