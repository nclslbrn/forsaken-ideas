import { polyline, line, rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
// import '../full-canvas.css'
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
    CSTM_FORMAT = quantity([420, 420], mm),
    SIZE = mul(CSTM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(35, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    COLORS = {
      paper: '#f2ede1',
      stripe: '#3a3a3a88',
      texts: '#888888',
      cells: '#e8b4ae'
    },
    STROKE_WEIGHT = 5,
    LETTER_SIZE = [24, 28],
    PRE_CHOICES = {
        numCell: [24, 128],
        numLayer: [2, 6],
        numLinePerLayer: [24, 96],
        ptPerLine: [12, 96],
        amplitude: [0.05, 1.5],
        cellPadding: [-2, 2],
        hasText: 0.5,
        hasCellContour: 0.5,
        hasStripe: 0.75
    },
    ANGLES = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4],
    GLYPHS = [
        '-/\\-/|v_____-/\\-///|\\__/\\---..___',
        '-W\\//T\\/====  //\\___//  \\\\____  xx^yy',
        '______________::::::::|||/\\___/..%..\\\\',
        '== == === == == __ ____ _____ _____  []..'
    ]

let drawElems, choices

ROOT.appendChild(CANVAS)

const rotateAround = ([x, y], [cx, cy], a) => {
    const c = Math.cos(a),
        s = Math.sin(a),
        dx = x - cx,
        dy = y - cy
    return [cx + dx * c - dy * s, cy + dx * s + dy * c]
}

const buildLineLayer = (
    numLayer,
    numPoint,
    ampFactor,
    size,
    margin,
    amplitude,
    rand
) => [
    ...repeatedly(() => {
        const angle = pickRandom(ANGLES, rand),
            isDiagonal = angle % (Math.PI / 2) !== 0,
            center = [margin + size[0] / 2, margin + size[1] / 2],
            diag = Math.hypot(size[0], size[1]),
            // len = length of each line, stack = extent they are spread across
            [len, stack] = isDiagonal
                ? [diag, diag]
                : angle === 0
                  ? [size[0], size[1]]
                  : [size[1], size[0]],
            stepNum = rand.minmaxInt(...numPoint),
            steps = Array.from(Array(stepNum)).map(() => rand.float() * 10),
            sum = steps.reduce((acc, val) => acc + val, 0),
            normSteps = steps.reduce(
                (acc, x) => [[...acc[0], acc[1] + x / sum], acc[1] + x / sum],
                [[0], 0]
            )[0],
            waveAmplitude = amplitude * rand.minmax(...ampFactor),
            waveOffsets = normSteps.map(
                () => (rand.float() * 2 - 1) * waveAmplitude
            ),
            lineCount = Math.ceil(stack / amplitude),
            x0 = center[0] - len / 2,
            y0 = center[1] - stack / 2

        return [
            ...repeatedly(
                (i) =>
                    normSteps.map((t, idx) =>
                        rotateAround(
                            [
                                x0 + t * len,
                                y0 + (i + 0.5) * amplitude + waveOffsets[idx]
                            ],
                            center,
                            angle
                        )
                    ),
                lineCount
            )
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
        amplitude = Math.max(...SIZE) / (numLinePerLayer + 1),
        cellPadding = rand.normMinMax(...PRE_CHOICES.cellPadding),
        cells = modularGrid(numCell, rand.float, height / width).map(
            ([x, y, w, h]) => [
                x * width + MARGIN,
                y * height + MARGIN,
                w * width,
                h * height
            ]
        ),
        cellsStripes = cells.map(() => rand.float() < PRE_CHOICES.hasStripe),
        lineLayer = buildLineLayer(
            numLayer,
            PRE_CHOICES.ptPerLine,
            PRE_CHOICES.amplitude,
            [width, height],
            MARGIN,
            amplitude,
            rand
        ),
        hasText = rand.float() < PRE_CHOICES.hasText,
        hasCellContour = rand.float() < PRE_CHOICES.hasCellContour,
        text = pickRandom(SENTENCES, rand) + pickRandom(GLYPHS, rand)

    // Debug purpose
    choices = {
        numCell,
        numLayer,
        amplitude,
        cellPadding,
        hasText,
        hasCellContour,
        text
    }

    drawElems = [
        rect(SIZE, { fill: COLORS.paper }),
        group(
            { __inkscapeLayer: 'Cells', stroke: COLORS.cells },
            hasCellContour
                ? cells.reduce(
                      (contours, [x, y, w, h], cellIdx) =>
                          // if there is cell stripes draw cell contour
                          cellsStripes[cellIdx]
                              ? [
                                  ...contours,
                                  ...(x+w < width ? [line([x+w, y], [x+w, y+h])] : []),
                                  ...(y+h < height ? [line([x, y+h], [x+w, y+h])] : [])
                                ]
                              : contours,
                      []
                  )
                : []
        ),
        group({ __inkscapeLayer: 'Texts', stroke: COLORS.texts, weight: STROKE_WEIGHT, strokeLinecap: 'round' }, [
            ...(hasText
                ? cells
                      .map(([x, y, w, h], cellIdx) =>
                          ! cellsStripes[cellIdx] && rand.float() > 0.5
                              ? [
                                  ...repeatedly2d((xx, yy) =>
                                      getGlyphVector(
                                          text[(xx + yy * Math.floor(w / LETTER_SIZE[0])) % text.length],
                                          LETTER_SIZE,
                                          [4 + x + xx * LETTER_SIZE[0], 4 + y + yy * LETTER_SIZE[1]]
                                      ).map((pts) => polyline(pts)),
                                      Math.floor(w / LETTER_SIZE[0]),
                                      Math.floor(h / LETTER_SIZE[1])
                                  )
                                ]
                              : []
                      ).flat()
                : []
            ).flat()
        ]),
        group({ __inkscapeLayer: 'Lines', stroke: COLORS.stripe, weight: STROKE_WEIGHT }, [
            ...cells
                .map(([x, y, w, h], cellIdx) =>
                    lineLayer[cellIdx % lineLayer.length].reduce(
                        (acc, line) =>
                            cellsStripes[cellIdx]
                                ? [
                                      ...acc,
                                      ...clipPolylinePoly(line, [
                                          [x + cellPadding, y + cellPadding],
                                          [
                                              x + w - cellPadding,
                                              y + cellPadding
                                          ],
                                          [
                                              x + w - cellPadding,
                                              y + h - cellPadding
                                          ],
                                          [x + cellPadding, y + h - cellPadding]
                                      ]).map((p) =>
                                          polyline(p)
                                      )
                                  ]
                                : acc,
                        []
                    )
                )
                .flat()
        ])
    ]
    draw(CTX, group({ __inkscapeLayer: 'Composition' }, drawElems))
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
