import { rect, group, polyline, bounds } from '@thi.ng/geom'
import { range } from '@thi.ng/transducers'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector, getParagraphVector } from '@nclslbrn/plot-writer'
import { add2 } from '@thi.ng/vectors'
import { pointInPolygon2 } from '@thi.ng/geom-isec'
import { asPolygons, asSDF, sample2d } from '@thi.ng/geom-sdf'
import { cleanDouble, getMinMaxPolysPoints } from './utils'
const worker = new Worker(new URL('./workers/plot-optimization.js', import.meta.url))

// Trace flow trails ------------------------------------------------------------
const trace = (STATE, type = 'pixel') => {
    const {
        seed,
        width,
        height,
        inner,
        trails,
        colors,
        attractor,
        operator,
        margin,
        labels,
        labelWidth
    } = STATE
    const domainScale = 0.95
    const cropPoly = [
        [margin, margin],
        [width - margin, margin],
        [width - margin, height - margin * 1.33],
        [margin, height - margin * 1.33]
    ]
    const fntSz = [width * 0.009, height * 0.017]
    // https://github.com/nclslbrn/plot-writer?tab=readme-ov-file#paragraph-multiple-lines-w-experimental-hyphenation
    const randTexts = labels.reduce((labelPolys, txt) => {
        const txtToPlot = getParagraphVector(txt[1], 22, 8, labelWidth)
        const txtPolys = txtToPlot.vectors.reduce(
            (polys, glyph) => [
                ...polys,
                ...glyph.map((vecs) =>
                    // Move txt vector to txt random position (picked in state.js)
                    polyline(vecs.map((v) => add2([], v, txt[0])))
                )
            ],
            []
        )

        const tickMargin = 24,
            tickLength = 32,
            tickMinMaxX = [
                getMinMaxPolysPoints(txtPolys, 'min', 'x'),
                getMinMaxPolysPoints(txtPolys, 'max', 'x')
            ],
            tickMinMaxY = [
                getMinMaxPolysPoints(txtPolys, 'min', 'y'),
                getMinMaxPolysPoints(txtPolys, 'max', 'y')
            ],
            tickOnRight = txt[0][0] < width / 2 - labelWidth / 2,
            tickOnTop = txt[0][1] > width / 2,
            tickY = tickOnTop
                ? tickMinMaxY[0] - tickMargin
                : tickMinMaxY[1] + tickMargin

        let tickVecs = [
            [tickMinMaxX[0], tickY],
            [tickMinMaxX[1], tickY]
        ]
        if (tickOnRight) {
            tickVecs.push([
                tickMinMaxX[1] + tickLength,
                tickY + (tickOnTop ? -1 : 1) * tickLength
            ])
        } else {
            tickVecs = [
                [
                    tickMinMaxX[0] - tickLength,
                    tickY + (tickOnTop ? -1 : 1) * tickLength
                ],
                ...tickVecs
            ]
        }

        return [...labelPolys, group({}, [...txtPolys, polyline(tickVecs)])]
    }, [])

    // https://github.com/thi-ng/umbrella/tree/develop/packages/geom-sdf#sdf-creation
    const RES = [256, 256]
    const randTextsBounds =
        type === 'vector'
            ? randTexts.map((txtGroup) => {
                  const txtBounds = bounds(txtGroup, 6),
                      sdf = asSDF(txtGroup),
                      image = sample2d(sdf, txtBounds, RES)
                  const contours = asPolygons(
                      image,
                      txtBounds,
                      RES,
                      range(0, 8, 4),
                      1
                  )
                  return contours
              })
            : false

    const inTxtBound = (vec, txtBounds) =>
        txtBounds.reduce(
            (isIn, poly) => isIn || pointInPolygon2(vec, poly.points),
            false
        )
    // https://docs.thi.ng/umbrella/geom-isec/functions/pointInPolygon2.html
    const removeBoundsFromLine = (line) => {
        let out = [[]],
            lineIdx = 0,
            wasInside = false

        line.forEach((vec) => {
            const isInside = randTextsBounds.reduce(
                (isIn, polys) => isIn || inTxtBound(vec, polys),
                false
            )
            if (wasInside && !isInside) {
                out.push([vec])
                lineIdx++
            }
            if (!isInside) {
                out[lineIdx].push(vec)
            }
            wasInside = isInside
        })
        return out
    }

    const strokeById = (idx) =>
        colors[idx % 17 === 0 ? 3 : idx % 43 === 0 ? 4 : 1]

    const comp = (uniqueLines) => [
        rect([width, height], { fill: colors[0] }),
        group({ weight: 0.75 }, [
            // bottom right label seed + attractor name + mixing formula
            group(
                { stroke: colors[2] },
                [
                    ...seed.substring(0, 24),
                    ...' → ',
                    ...attractor,
                    ...' → ',
                    ...operator
                ].reduce(
                    (poly, letter, x) => [
                        ...poly,
                        ...getGlyphVector(letter, fntSz, [
                            margin + fntSz[0] * x * 1.1,
                            height - margin
                        ]).map((vecs) => polyline(vecs))
                    ],
                    []
                )
            ),
            // bottom left label timestamp
            group(
                { stroke: colors[2] },
                [...new Date().toISOString()].reduce(
                    (poly, letter, x) => [
                        ...poly,
                        ...getGlyphVector(letter, fntSz, [
                            width -
                                margin -
                                fntSz[0] * 26.4 +
                                fntSz[0] * x * 1.1,
                            height - margin
                        ]).map((vecs) => polyline(vecs))
                    ],
                    []
                )
            ),
            // the flow fields trails
            ...uniqueLines,
            // randomly placed random arbitrary labels (./LABELS.js)
            type === 'pixel'
                ? group({ stroke: colors[0], weight: 8 }, randTexts)
                : group(),
            group({ stroke: colors[2] }, randTexts)
        ])
    ]
    const lines =
        type === 'pixel'
            ? trails.reduce((acc, line, idx) => {
                  const cropped = clipPolylinePoly(
                      line.map((pos) => [
                          width / 2 + pos[0] * inner[0] * domainScale,
                          height / 2 + pos[1] * inner[1] * domainScale
                      ]),
                      cropPoly
                  )

                  return [
                      ...acc,
                      ...cropped.map((line) =>
                          polyline(line, {
                              stroke: strokeById(idx),
                              weight: 0.5
                          })
                      )
                  ]
              }, [])
            : trails.reduce(
                  (acc, line, idx) => [
                      ...acc,
                      ...clipPolylinePoly(
                          line.map((pos) => [
                              width / 2 + pos[0] * inner[0] * domainScale,
                              height / 2 + pos[1] * inner[1] * domainScale
                          ]),
                          cropPoly
                      ).reduce(
                          (splitted, vecs) => [
                              ...splitted,
                              ...removeBoundsFromLine(vecs).map((cleaned) =>
                                  polyline(cleaned, {
                                      stroke: strokeById(idx)
                                  })
                              )
                          ],
                          []
                      )
                  ],
                  []
              )
    if (type === 'pixel') {
      return comp(lines)
    } else {
      worker.postMessage(lines).then((e) => {
        console.log('THEN')
        return comp(e.data.map((line) => polyline(...line)))
      }) 
      
      //return comp(cleanDouble(lines))
    }
}



// Display message while flow field is processed ---------------------------------
const traceLoadScreen = (STATE) => {
    const { seed, width, height, colors, margin } = STATE
    const fntSz = [width * 0.009, height * 0.012]

    return [
        rect([width, height], { fill: colors[0] }),
        group({ weight: 1.5, stroke: colors[1] }, [
            ...[...'generating ', ...seed].reduce(
                (poly, letter, x) => [
                    ...poly,
                    ...getGlyphVector(letter, fntSz, [
                        margin + fntSz[0] * x * 1.1,
                        height / 2
                    ]).map((vecs) => polyline(vecs))
                ],
                []
            )
        ])
    ]
}
export { trace, traceLoadScreen }
