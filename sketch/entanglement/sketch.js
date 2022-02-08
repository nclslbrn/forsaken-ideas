import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import {
    randomIntBetween,
    randomFloatBetween
} from '../../src/js/sketch-common/rand-between'
import Hexagon from './Hexagon'
import Checkerboard from './Checkerboard'
import dashLine from './dashLine'

const svg = new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'A3_portrait'
})

let hexRadius, inner, checker, hexagons, lineSpacing

const sketch = {
    launch: () => {
        svg.init()
        // debug svg.elem.style = 'max-width: unset;'
        sketch.margin = svg.cmToPixels(2)
        lineSpacing = svg.cmToPixels(1)
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clear()
        hexagons = []
        hexRadius = svg.cmToPixels(randomFloatBetween(2, 6))
        inner = [svg.width - sketch.margin * 2, svg.height - sketch.margin * 2]
        checker = new Checkerboard(
            inner,
            sketch.margin,
            randomIntBetween(5, 12)
        )
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

        /*  checker.getCells().forEach((cell) => {
            svg.rect(cell)
        }) */
        // sketch.drawHexagons()
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
                            svg.path({
                                points: dash,
                                stroke: 'black',
                                //strokeWidth: svg.cmToPixels(0.05),
                                fill: 'none',
                                close: false
                            })
                        })
                    }
                })
                /* svg.path({
                    points: line,
                    stroke: 'tomato',
                    //strokeWidth: svg.cmToPixels(0.05),
                    fill: 'none',
                    close: false
                }) */
            })
            svg.path({
                points: hex.getContour(),
                stroke: 'tomato',
                fill: 'none',
                close: true
            })
        })
    },
    drawHexagons: () => {
        hexagons.forEach((hex) =>
            svg.path({
                points: hex.getContour(),
                close: true,
                fill: 'rgba(255, 255, 255, 0.5)',
                stroke: 'black'
            })
        )
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'isometric-perspective' })
    }
}

export default sketch
