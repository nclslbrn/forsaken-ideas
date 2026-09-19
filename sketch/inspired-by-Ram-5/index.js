import { polyline, line, rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandomKey, SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { repeatedly } from '@thi.ng/transducers'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import modularGrid from './modular-grid'

const DPI = quantity(96, dpi),
    CSTM_FORMAT = quantity([320, 460], mm),
    SIZE = mul(CSTM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { floor, hypot, min } = Math

let width, height, drawElems

ROOT.appendChild(CANVAS)

const PAPER = '#f2ede1'
const INK = '#1a1a1a'
const GRID = '#e8b4ae'
const STROKE_WEIGHT = 2.5

const buildLineLayer = (numLayer, numLinePerLayer, numPoint, size, rand) => [
    ...repeatedly(() => {
        const isVertical = rand.float() > 0.5,
            amplitude = size[isVertical ? 0 : 1] / (numLinePerLayer + 1),
            stepNum = rand.minmaxInt(...numPoint),
            steps = Array.from(Array(stepNum)).map(() => rand.float() * 10),
            sum = steps.reduce((acc, val) => acc + val, 0),
            normSteps = steps.reduce(
                (acc, x) => [
                    [...acc[0], acc[1] + x / sum], // current pos
                    acc[1] + x / sum // next break start
                ],
                [[0], 0]
            )[0],
            waveAmplitude = amplitude * 4,
            waveOffsets = normSteps.map(
                () => (rand.float() * 2 - 1) * waveAmplitude
            )

        return [
            ...repeatedly((i) => {
                const base = (i + 0.5) * amplitude
                if (isVertical) {
                    return normSteps.map((y, idx) => [
                        base + waveOffsets[idx],
                        y * size[1]
                    ])
                } else {
                    return normSteps.map((x, idx) => [
                        x * size[0],
                        base + waveOffsets[idx]
                    ])
                }
            }, numLinePerLayer)
        ]
    }, numLayer)
]

const buildGrid = (cells) =>
    cells.map(([x, y, w, h]) => rect([x, y], [w, h], { stroke: GRID }))

const variations = {
    sparse: {
        numCell: [6, 12],
        numLayer: [4, 6],
        numLinePerLayer: [4, 12],
        ptPerLine: [16, 24]
    },
    scattered: {
        numCell: [32, 48],
        numLayer: [3, 6],
        numLinePerLayer: [16, 32],
        ptPerLine: [16, 24]
    },
    dense: {
        numCell: [64, 98],
        numLayer: [2, 4],
        numLinePerLayer: [32, 64],
        ptPerLine: [4, 8]
    }
}
const setup = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const rand = SYSTEM,
        iteration = pickRandomKey(variations, rand),
        iterVals = variations[iteration],
        numCell = rand.minmaxInt(...iterVals.numCell, rand),
        numLayer = rand.minmaxInt(...iterVals.numLayer, rand),
        numLinePerLayer = rand.minmaxInt(...iterVals.numLinePerLayer, rand),
        cells = modularGrid(numCell, rand.float).map(([x, y, w, h]) => [
            x * width + MARGIN,
            y * height + MARGIN,
            w * width,
            h * height
        ]),
        lineLayer = buildLineLayer(
            numLayer,
            numLinePerLayer,
            iterVals.ptPerLine,
            SIZE,
            rand
        )

    drawElems = [
        rect(SIZE, { fill: PAPER }),
        ...buildGrid(cells),
        ...cells.flatMap(([x, y, w, h], cellIdx) => {
            const pickedLayer = lineLayer[cellIdx % lineLayer.length]
            const m = 0
            return pickedLayer.reduce(
                (acc, line) => [
                    ...acc,
                    ...clipPolylinePoly(line, [
                        [x + m, y + m],
                        [x + w - m, y + m],
                        [x + w - m, y + h - m],
                        [x + m, y + h - m]
                    ]).map((p) =>
                        polyline(p, { stroke: INK, weight: STROKE_WEIGHT })
                    )
                ],
                []
            )
        })
    ]

    draw(CTX, group({}, drawElems))
    console.log(iteration)
}

setup()
window.setup = setup

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Inspired-by-Ram-5-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Inspired-by-Ram-5-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, drawElems)
            )
        )
    )
}

window.infobox = infobox
handleAction()
