import {
    polyline,
    rect,
    group,
    svgDoc,
    asSvg,
    scaleWithCenter,
    text
} from '@thi.ng/geom'
import { pickRandom, pickRandomKey, SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
// import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'

import { COLORS, PRE_CHOICES } from './CONST'
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
        propsName = pickRandomKey(PRE_CHOICES),
        iterationProps = PRE_CHOICES.dense, //PRE_CHOICES[propsName],
        numCell = rand.minmaxInt(...iterationProps.numCell),
        numLayer = rand.minmaxInt(...iterationProps.numLayer),
        numLinePerLayer = rand.minmaxInt(...iterationProps.numLinePerLayer),
        amplitude = Math.max(...SIZE) / (numLinePerLayer + 1),
        cellPadding = rand.normMinMax(...iterationProps.cellPadding),
        baseCells = modularGrid(
            numCell / 2,
            rand.float,
            [[0, 0, 1, 1]],
            height / width
        ),
        extCells = modularGrid(numCell, rand.float, baseCells, height / width),
        cells = [...baseCells, ...extCells].map(([x, y, w, h]) => [
            x * width + MARGIN,
            y * height + MARGIN,
            w * width,
            h * height
        ]),
        cellsStripes = cells.map(() => rand.float() < iterationProps.hasStripe),
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
            rand,
            iterationProps
        )
    //  Debug purpose
    choices = {
        propsName,
        numCell,
        cellPadding,
        numLayer,
        amplitude
    }

    drawElems = [
      rect(SIZE, { fill: COLORS.paper }),
      // Loops over grid cells
      ...cells.reduce((groups, [x, y, w, h], cellIdx) => {
        // Grab lines from one layer, (iterate layer for each cell
        const lines = lineLayer[cellIdx % lineLayer.length].reduce((acc, line) => {
            // Check whether a cell can contain stripes
            if (cellsStripes[cellIdx]) {
              const hasVariation = cellIdsWithVariation.includes(cellIdx)
              const clipped = clipPolylinePoly(line, [
                [x + cellPadding, y + cellPadding],
                [x + w - cellPadding, y + cellPadding],
                [x + w - cellPadding, y + h - cellPadding],
                [x + cellPadding, y + h - cellPadding]
              ])
              // If cell has variation, rescale lines and put it on group #2
              if (hasVariation) {
                return [
                  acc[0],
                  [
                    ...acc[1],
                    ...clipped.map((pts) =>
                      scaleWithCenter(
                        polyline(pts),
                        [x + w / 2, y + h / 2],
                        cellIdsWithVariation[0] === cellIdx
                          ? 0.5
                          : 1.15
                      )
                    )
                  ],
                ]
              } else {
                // if not put them on group #1
                return [
                  [
                    ...acc[0],
                    ...clipped.map((pts) => polyline(pts))
                  ],
                  acc[1]
                ]
              }
            } else {
              return acc
            }
          },
          [[], []]
        )
        return groups.map((g, i) => g.add(...lines[i]))
      },
        [
          group(
              {
                  __inkscapeLayer: 'Regular',
                  stroke: COLORS.stripe,
                  weight: iterationProps.weight,
              },
              [

              ]
          ),
          group(
              {
                  __inkscapeLayer: 'Variation',
                  stroke: COLORS.variation,
                  weight: iterationProps.weight
              },
              []
          )
        ]
      ),
      text(
        [MARGIN, CANVAS.height - MARGIN * 0.66],
        `[${propsName}]`,
        {
          font: '28px Inter',
          align: "left",
          baseline: "middle",
          fill: COLORS.stripe
        }
      )
    ]
    console.log(drawElems)
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
