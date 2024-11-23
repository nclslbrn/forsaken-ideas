import { rect, group, polyline, bounds } from '@thi.ng/geom'
import { range } from '@thi.ng/transducers'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector, getParagraphVector } from '@nclslbrn/plot-writer'
import { add2 } from '@thi.ng/vectors'
import { pointInPolygon2 } from '@thi.ng/geom-isec'
import { asPolygons, asSDF, sample2d } from '@thi.ng/geom-sdf'
import { getMinMaxPolysPoints, removeOverlapingSegments } from './utils'
// Trace flow trails ------------------------------------------------------------
const trace = (STATE) => {
    const {
        seed,
        width,
        height,
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
    const inner = [width - margin * 2, height - margin * 2]
    const fntSz = [width * 0.009, height * 0.015]

    // https://github.com/nclslbrn/plot-writer?tab=readme-ov-file#paragraph-multiple-lines-w-experimental-hyphenation
    const randTexts = labels.reduce((labelPolys, txt) => {
        const txtToPlot = getParagraphVector(txt[1], 14, 8, labelWidth)
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
    const randTextsBounds = randTexts.map((txtGroup) => {
        const txtBounds = bounds(txtGroup, 8),
            sdf = asSDF(txtGroup),
            image = sample2d(sdf, txtBounds, RES)
        const contours = asPolygons(image, txtBounds, RES, range(0, 12, 4), 1)
        return contours
    })

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
    const lines = trails.reduce(
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
                            stroke: colors[
                                idx % 17 === 0 ? 3 : idx % 43 === 0 ? 4 : 1
                            ]
                        })
                    )
                ],
                []
            )
        ],
        []
    )
    //const uniqueLines = removeOverlapingSegments(lines)

    return [
        rect([width, height], { fill: colors[0] }),
        group({ weight: 1 }, [
            // bottom right label seed + attractor name + mixing formula
            group(
                { stroke: colors[2], weight: 1.5 },
                [...seed, ...' → ', ...attractor, ...' → ', ...operator].reduce(
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
                { stroke: colors[2], weight: 1.5 },
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
            // randomly placed random arbitrary labels (./LABELS.js)
            //...randTextsBounds,
            group({ stroke: colors[2], weight: 3 }, randTexts),
            // the flow fields trails
            ...lines
        ])
    ]
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
