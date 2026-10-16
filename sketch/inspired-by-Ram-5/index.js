import {
    polyline,
    line,
    rect,
    group,
    svgDoc,
    asSvg,
    scaleWithCenter
} from '@thi.ng/geom'
import { pickRandom, SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
// import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'

import { COLORS, STROKE_WEIGHT, PRE_CHOICES } from './CONST'
import modularGrid from './modular-grid'
import { buildLineLayer } from './buildLineLayer'

const DPI = quantity(96, dpi),
    CSTM_FORMAT = quantity([297, 297], mm),
    SIZE = mul(CSTM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(40, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let drawElems, choices

ROOT.appendChild(CANVAS)


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
        // Add two more cells with different density
        cellIdsWithVariation = Array.from(Array(2)).map(() => {
            const freeCellIds = cellsStripes
                    .map((isFilled, id) => ({ isFilled, id }))
                    .filter((cell) => !cell.isFilled)
                    .map((cell) => cell.id),
                randId = pickRandom(freeCellIds, rand)
            cellsStripes[randId] = true // set cell filled
            return randId
        }),
        lineLayer = buildLineLayer(
            numLayer,
            [width, height],
            MARGIN,
            amplitude,
            rand
        ),
        hasCellContour = rand.float() < PRE_CHOICES.hasCellContour,
        //  Debug purpose
        choices = {
            numCell,
            cellPadding,
            numLayer,
            amplitude,
            hasCellContour,
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
                                    ...(x + w < width
                                        ? [line([x + w, y], [x + w, y + h])]
                                        : []),
                                    ...(y + h < height
                                        ? [line([x, y + h], [x + w, y + h])]
                                        : [])
                                ]
                              : contours,
                      []
                  )
                : []
        ),

        group(
            {
                __inkscapeLayer: 'Lines',
                stroke: COLORS.stripe,
                weight: STROKE_WEIGHT
            },
            [
                ...cells
                    .map(([x, y, w, h], cellIdx) =>
                        lineLayer[cellIdx % lineLayer.length].reduce(
                            (acc, line) =>
                                cellsStripes[cellIdx]
                                    ? [
                                          ...acc,
                                          ...clipPolylinePoly(line, [
                                              [
                                                  x + cellPadding,
                                                  y + cellPadding
                                              ],
                                              [
                                                  x + w - cellPadding,
                                                  y + cellPadding
                                              ],
                                              [
                                                  x + w - cellPadding,
                                                  y + h - cellPadding
                                              ],
                                              [
                                                  x + cellPadding,
                                                  y + h - cellPadding
                                              ]
                                          ]).map((p) => {
                                            const hasVariation = cellIdsWithVariation.includes(cellIdx)
                                            const stripes = scaleWithCenter(
                                              polyline(p, {...(hasVariation) && { stroke: COLORS.variation } }),
                                              [x + w / 2, y + h / 2],
                                                hasVariation
                                                ? cellIdsWithVariation[0] ===
                                                  cellIdx
                                                  ? 0.5
                                                  : 1.15
                                                : 1
                                            )
                                            return stripes
                                          })
                                      ]
                                    : acc,
                            []
                        )
                    )
                    .flat()
            ]
        )
    ]
    draw(CTX, group({ __inkscapeLayer: 'Composition' }, drawElems))
    console.table(choices)
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
