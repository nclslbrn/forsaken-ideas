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
const simplex = new SimplexNoise()
const freq = 0.005
const step = 3
let hexRadius, inner, checker, hexagons, lineSpacing, checkerNum

const sketch = {
    launch: () => {
        svg.init()
        //svg.elem.style.maxWidth = 'unset'
        sketch.margin = svg.cmToPixels(2)
        lineSpacing = svg.cmToPixels(0.25)
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clear()
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
                for (let x = 0; x < cell.w; x += lineSpacing * 0.75) {
                    for (let y = 0; y < cell.h; y += lineSpacing * 0.75) {
                        let pos = {
                            x: cell.x + x,
                            y: cell.y + y
                        }
                        swirl = []
                        let isGone = false
                        for (let j = 0; j < lineSpacing / 2 && !isGone; j++) {
                            const n = simplex.noise2D(
                                pos.x * freq,
                                pos.y * freq
                            )
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
                                close: false
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
                dashLine(line, lineSpacing).forEach((dashedLine, i) => {
                    if (i % 2) {
                        dashedLine.forEach((dash) => {
                            if (
                                checker.pointIsHoverDarkBox({
                                    x: dash[0][0],
                                    y: dash[0][1]
                                })
                            ) {
                                const noisedDash = dash.map((point) => {
                                    const n = simplex.noise2D(
                                        point[0] * freq,
                                        point[1] * freq
                                    )
                                    return [
                                        (point[0] += Math.cos(n) * step * 5),
                                        (point[1] += Math.sin(n) * step * 5)
                                    ]
                                })
                                svg.path({
                                    points: noisedDash,
                                    stroke: 'black',
                                    fill: 'none',
                                    close: false
                                })
                            } else {
                                svg.path({
                                    points: dash,
                                    stroke: 'black',
                                    fill: 'none',
                                    close: false
                                })
                            }
                        })
                    }
                })
            })
        })
    },
    drawHexagons: () => {
        hexagons.forEach((hex) =>
            svg.path({
                points: hex.getContour(),
                close: true,
                fill: 'rgba(255, 255, 255, 0)',
                stroke: 'black'
            })
        )
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'entanglement' })
    }
}

export default sketch
