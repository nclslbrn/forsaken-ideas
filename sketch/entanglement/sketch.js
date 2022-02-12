import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import {
    randomIntBetween,
    randomFloatBetween
} from '../../src/js/sketch-common/rand-between'
import Hexagon from './Hexagon'
import Checkerboard from './Checkerboard'
import dashLine from './dashLine'
import SimplexNoise from 'simplex-noise'

const svg = new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'A3_landscape'
    //background: 'black'
})
const groups = [
    { name: 'line', stroke: 'black' },
    { name: 'frame', stroke: 'tomato' }
]
const simplex = new SimplexNoise()

const step = 12
let hexRadius, inner, checker, hexagons, lineSpacing, checkerNum

const noise = (x, y) => {
    const freq = 0.007
    const turbulence = 0.5
    return turbulence * simplex.noise2D(x * freq, y * freq)
}

const sketch = {
    launch: () => {
        svg.init()
        //svg.elem.style.maxWidth = 'unset'
        groups.forEach((g) => svg.group(g))
        sketch.margin = svg.cmToPixels(3.5)
        lineSpacing = svg.cmToPixels(1)
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clearGroups()
        hexagons = []
        hexRadius = svg.cmToPixels(randomFloatBetween(2, 4))
        inner = [svg.width - sketch.margin * 2, svg.height - sketch.margin * 2]
        checkerNum = randomIntBetween(3, 7)
        checker = new Checkerboard(inner, sketch.margin, checkerNum)
        const numCell = [
            Math.floor(inner[0] / (2 * hexRadius)) - 1,
            Math.floor(inner[1] / (2 * hexRadius)) - 1
        ]
        const hexMargin = [
            (inner[0] - hexRadius * 2 * (numCell[0] - 0.5)) / 2,
            (inner[1] - hexRadius * 1.74 * numCell[1]) / 2
        ]
        svg.rect({
            x: sketch.margin,
            y: sketch.margin,
            w: svg.width - sketch.margin * 2,
            h: svg.height - sketch.margin * 2,
            group: groups[1].name,
            fill: 'none',
            stroke: 'tomato'
        })
        for (let x = 0; x < numCell[0]; x++) {
            for (let y = 0; y < numCell[1]; y++) {
                if (y % 2 !== 0 || x !== numCell[0] - 1) {
                    const hPos = [
                        (y % 2 == 0 ? 0.75 + x : 0.25 + x) * hexRadius * 2,
                        (y + 0.5) * hexRadius * 1.74
                    ]
                    hexagons.push(
                        new Hexagon(
                            sketch.margin + hexMargin[0] + hPos[0],
                            sketch.margin + hexMargin[1] + hPos[1],
                            hexRadius * 2 * 0.58
                        )
                    )
                }
            }
        }

        checker.getCells().forEach((cell) => {
            if (
                (cell.i === 'even' && checkerNum % 2 !== 0) ||
                (cell.i === 'odd' && checkerNum % 2 === 0)
            ) {
                let swirl
                for (let x = 0; x < cell.w; x += lineSpacing * 0.2) {
                    for (let y = 0; y < cell.h; y += lineSpacing * 0.2) {
                        let pos = {
                            x: cell.x + x,
                            y: cell.y + y
                        }
                        swirl = []
                        let isGone = false
                        for (let j = 0; j < 2 && !isGone; j++) {
                            const n = noise(pos.x, pos.y)
                            pos.x += Math.cos(n) * step
                            pos.y += Math.sin(n) * step
                            if (
                                pos.x < cell.x ||
                                pos.x > cell.x + cell.w ||
                                pos.y < cell.y ||
                                pos.y > cell.y + cell.h ||
                                sketch.isPointInHex(pos)
                            ) {
                                isGone = true
                            } else {
                                swirl.push([pos.x, pos.y])
                            }
                        }
                        if (undefined !== swirl[0]) {
                            svg.path({
                                points: swirl,
                                stroke: 'black',
                                fill: 'none',
                                close: false,
                                group: groups[0].name
                            })
                        }
                    }
                }
            }
        })
        //sketch.drawHexagons()
        sketch.drawHexagonsStripes()
    },
    isPointInHex: (point) => {
        const inHexagons = hexagons.map((hex) => hex.isPointInsideHex(point))
        return inHexagons.reduce((acc, val) => {
            return val || acc ? true : false
        }, false)
    },
    drawHexagonsStripes: () => {
        hexagons.forEach((hex) => {
            hex.getStripe(12).forEach((line) => {
                const start = [...line[0]]
                const end = sketch.splitLineByBox([...line])
                const c = checker.pointIsHoverDarkBox([...start]) ? 0 : 1
                console.log(end.length)
                if (end.length === 0) {
                    svg.path({
                        points: line,
                        fill: 'none',
                        close: false,
                        stroke: c % 2 === 0 ? 'tomato' : 'steelblue',
                        group: groups[0].name
                    })
                } else {
                    let prev = [...start]
                    end.push([...line[1]])
                    end.forEach((stop, i) => {
                        svg.path({
                            points: [prev, stop],
                            fill: 'none',
                            close: false,
                            stroke: (i + c) % 2 === 0 ? 'tomato' : 'steelblue',
                            group: groups[0].name
                        })
                        prev = stop
                    })
                }

                /* dashLine(line, lineSpacing).forEach((dashedLine) => {
                    dashedLine.forEach((dash) => {
                        if (checker.pointIsHoverDarkBox([...dash[0]])) {
                            const noisedDash = dash.map((point) => {
                                const n = noise(point[0], point[1])
                                return [
                                    (point[0] += Math.cos(n) * step * 2),
                                    (point[1] += Math.sin(n) * step * 2)
                                ]
                            })
                            svg.path({
                                points: noisedDash,
                                stroke: 'black',
                                fill: 'none',
                                close: false,
                                group: groups[0].name
                            })
                        } else {
                            svg.path({
                                points: dash,
                                stroke: 'black',
                                fill: 'none',
                                close: false,
                                group: groups[0].name
                            })
                        }
                    })
                })
                */
            })
        })
    },
    splitLineByBox: (line) => {
        const angle = Math.atan2(
            line[1][1] - line[0][1],
            line[1][0] - line[0][0]
        )
        const size = Math.sqrt(
            Math.abs(line[1][0] - line[0][0]) ** 2 +
                Math.abs(line[1][1] - line[0][1]) ** 2
        )
        let point = [...line[0]]
        let d = 0
        const intersect = []
        let onDark = checker.pointIsHoverDarkBox([...point])
        while (d <= size) {
            const pos = [
                point[0] + Math.cos(angle) * d,
                point[1] + Math.sin(angle) * d
            ]
            const isOnDark = checker.pointIsHoverDarkBox([...pos])
            if (onDark !== isOnDark) {
                intersect.push([...pos])
                onDark = isOnDark
            }
            d++
        }
        return intersect
    },
    drawHexagons: () => {
        hexagons.forEach((hex) =>
            svg.path({
                points: hex.getContour(),
                close: true,
                fill: 'none',
                stroke: 'black',
                group: groups[0].name
            })
        )
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'entanglement' })
    }
}

export default sketch
