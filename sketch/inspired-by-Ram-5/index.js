import { polyline, line, rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import modularGrid from './modular-grid'
import { SENTENCES } from './SENTENCES'

const DPI = quantity(96, dpi),
    CSTM_FORMAT = quantity([320, 320], mm),
    SIZE = mul(CSTM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    PAPER = '#f2ede1',
    INK = '#1a1a1a',
    TEXT = '#888',
    GRID = '#e8b4ae',
    STROKE_WEIGHT = 2.5,
    PRE_CHOICES = {
        numCell: [48, 128],
        numLayer: [2, 4],
        numLinePerLayer: [24, 96],
        ptPerLine: [4, 48],
        amplitude: [0.5, 4],
        cellPadding: [-4, 8],
        hasText: 0.2,
        hasCellDrawn: 0.8
    }

let drawElems, choices

ROOT.appendChild(CANVAS)

const fillPart = (text, x, y, w, h, b) => {
    const cols = Math.floor(w / b),
        rows = Math.floor(h / b),
        grid = [
            ...repeatedly2d(
                (i, j) =>
                    getGlyphVector(
                        text[(i + cols * j) % text.length],
                        [b, b],
                        [x + i * b, y + j * b]
                    ),
                cols,
                rows - 1
            )
        ]
    return grid.flat()
}

const buildLineLayer = (
    numLayer,
    numLinePerLayer,
    numPoint,
    ampFactor,
    size,
    amplitude,
    rand
) => [
    ...repeatedly(() => {
        const isVertical = rand.float() > 0.5,
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
            waveAmplitude = amplitude * rand.minmax(...ampFactor),
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

const setup = () => {
    const width = SIZE[0] - MARGIN * 2
    const height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const rand = SYSTEM,
        numCell = rand.minmaxInt(...PRE_CHOICES.numCell),
        numLayer = rand.minmaxInt(...PRE_CHOICES.numLayer),
        numLinePerLayer = rand.minmaxInt(...PRE_CHOICES.numLinePerLayer),
        amplitude = Math.min(...SIZE) / (numLinePerLayer + 1),
        cellPadding = rand.normMinMax(...PRE_CHOICES.cellPadding),
        cells = modularGrid(numCell, rand.float).map(([x, y, w, h]) => [
            x * width + MARGIN,
            y * height + MARGIN,
            w * width,
            h * height
        ]),
        lineLayer = buildLineLayer(
            numLayer,
            numLinePerLayer,
            PRE_CHOICES.ptPerLine,
            PRE_CHOICES.amplitude,
            SIZE,
            amplitude,
            rand
        ),
        hasText = rand.float() < PRE_CHOICES.hasText,
        hasCellDrawn = rand.float() < PRE_CHOICES.hasCellDrawn,
        text = hasText ? pickRandom(SENTENCES, rand) : '',
        choices = {
            numCell,
            numLayer,
            numLinePerLayer,
            amplitude,
            cellPadding,
            hasText,
            hasCellDrawn,
            text
        }

    drawElems = [
        rect(SIZE, { fill: PAPER }),
        // cells contours
        ...(hasCellDrawn
            ? cells.map(([x, y, w, h]) =>
                  rect([x, y], [w, h], { stroke: GRID })
              )
            : []),
        // texts
        group({}, [
            ...(hasText
                ? cells
                      .map(([x, y, w, h], cellIdx) =>
                          cellIdx % 3 === 0
                              ? fillPart(
                                    text,
                                    x,
                                    y,
                                    w,
                                    h,
                                    MARGIN * 0.33
                                ).reduce(
                                    (acc, pts) => [
                                        ...acc,
                                        polyline(pts, {
                                            stroke: TEXT,
                                            weight: 1
                                        })
                                    ],
                                    []
                                )
                              : []
                      )
                      .flat()
                : []),
            // lines
            ...cells
                .map(([x, y, w, h], cellIdx) =>
                    lineLayer[cellIdx % lineLayer.length].reduce(
                        (acc, line) => [
                            ...acc,
                            ...clipPolylinePoly(line, [
                                [x + cellPadding, y + cellPadding],
                                [x + w - cellPadding, y + cellPadding],
                                [x + w - cellPadding, y + h - cellPadding],
                                [x + cellPadding, y + h - cellPadding]
                            ]).map((p) =>
                                polyline(p, {
                                    stroke: INK,
                                    weight: STROKE_WEIGHT
                                })
                            )
                        ],
                        []
                    )
                )
                .flat()
        ])
    ]
    draw(CTX, group({}, drawElems))
    console.log(choices)
}

setup()
window.setup = setup

window['exportJPG'] = () => {
    downloadCanvas(
        CANVAS,
        `Inspired-by-Ram-5-${FMT_yyyyMMdd_HHmmss()}`,
        'jpeg',
        1
    )
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
