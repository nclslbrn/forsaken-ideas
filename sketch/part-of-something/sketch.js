import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import SimplexNoise from 'simplex-noise'
import { getLineLineCollision } from './trigonometry'
import isPointInsidePolygon from './isPointInsidePolygon'
import Notification from '../../src/js/sketch-common/Notification'
import Part from './Part'
import { getColorCombination } from '../../src/js/sketch-common/stabilo68-colors'
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
const container = document.getElementById('windowFrame')
const svg = new SvgTracer({
        parentElem: container,
        size: 'A3_landscape'
    }),
    simplex = new SimplexNoise(),
    N = ceil(random() * 3),
    I = 72,
    randomBetween = (interval = { min: 0, max: 1 }) => {
        return interval.min + Math.random() * (interval.max - interval.min)
    },
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
    palette: getColorCombination(2),
    // setup
    launch: () => {
        svg.init()
        /*
        svg.elem.style.width = '100vw'
        svg.elem.style.maxWidth = '100vw'
        svg.elem.style.maxHeight = '100vh'
        */
        margin = svg.cmToPixels(3)
        tileSize = [
            round((svg.width - margin * 2) / N),
            round((svg.height - margin * 2) / N)
        ]
        sketch.palette.colors.forEach((color) =>
            svg.group({
                name: color.id,
                id: color.id,
                stroke: color.value
            })
        )
        svg.group({
            name: 'black',
            id: 'black',
            stroke: 'black'
        })
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clearGroups()
        svg.rect({
            x: margin,
            y: margin,
            w: svg.width - margin * 2,
            h: svg.height - margin * 2,
            fill: 'none',
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
        const penSpecs = sketch.palette.colors.reduce((specs, color) => {
            return specs + `<br> - 88/${color.id} ${color.name}`
        }, '(Stabilo Art markers)')
        new Notification(
            `${sketch.palette.name} palette ${penSpecs}`,
            container,
            'light'
        )
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
            const radiusStep = svg.cmToPixels(
                randomBetween({ min: 0.07, max: 0.4 })
            )
            // Ugly hack to loop between -PI & PI
            if (minAngle <= -PI / 2 && maxAngle >= PI / 2) {
                minAngle = 0
                maxAngle = PI * 2.001
            }
            let pointByCircle = 20
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
                        svg.path({
                            points: arc,
                            stroke: sketch.palette.colors[
                                i % sketch.palette.colors.length
                            ].value,
                            fill: 'none',
                            close: false,
                            group: sketch.palette.colors[
                                i % sketch.palette.colors.length
                            ].id,
                            strokeWidth: svg.cmToPixels(0.1)
                        })
                    }
                })
                pointByCircle += 30
            }
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'part-of-something' })
    }
}

export default sketch
