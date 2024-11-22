import { rect, group, polyline, bounds } from '@thi.ng/geom'
import { range } from '@thi.ng/transducers'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector, getParagraphVector } from '@nclslbrn/plot-writer'
import { add2 } from '@thi.ng/vectors'
import { pointInPolygon2 } from '@thi.ng/geom-isec'
import { asPolygons, asSDF, sample2d } from '@thi.ng/geom-sdf'

// Trace flow trails ------------------------------------------------------------
const trace = (STATE) => {
    const {
        seed,
        width,
        height,
        trails,
        color,
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
        const txtToPlot = getParagraphVector(txt[1], 16, 8, labelWidth)
        const txtPolys = txtToPlot.vectors.reduce(
            (polys, glyph) => [
                ...polys,
                ...glyph.map((vecs) =>
                    polyline(vecs.map((v) => add2([], v, txt[0])))
                )
            ],
            []
        )

        const paraHeight = txtToPlot.height / 1.4
        const tickLength = labelWidth / 8
        let tickVecs = [
            [0, paraHeight],
            [labelWidth, paraHeight]
        ]
        if (txt[0][0] < width / 2) {
            tickVecs.push([labelWidth + tickLength, paraHeight + tickLength])
        } else {
            tickVecs = [[-tickLength, tickLength + paraHeight], ...tickVecs]
        }
        const tick = polyline(tickVecs.map((v) => add2([], v, txt[0])))

        return [...labelPolys, group({}, [...txtPolys, tick])]
    }, [])
    // https://github.com/thi-ng/umbrella/tree/develop/packages/geom-sdf#sdf-creation
    const RES = [128, 128]
    const randTextsBounds = randTexts.map((txtGroup) => {
        const txtBounds = bounds(txtGroup, 12),
            sdf = asSDF(txtGroup),
            image = sample2d(sdf, txtBounds, RES)
        const contours = asPolygons(
            image,
            txtBounds,
            RES,
            range(0, 16, 4),
            0.15
        )
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

    // Random in flow field label
    return [
        rect([width, height], { fill: '#222' }), //color }),
        group({ weight: 1, stroke: '#0cc' }, [
            // bottom right label seed + attractor name + mixing formula
            group(
                { stroke: 'white' },
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
                { stroke: 'white' },
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
            // group({}, randTextsBounds),
            group({ stroke: 'white' }, randTexts),
            // the flow fields trails
            ...trails.reduce(
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
                                polyline(
                                    cleaned,
                                    idx % 17 === 0 ? { stroke: 'white' } : 
                                  idx % 43 === 0 ? { stroke: 'tomato' } : {}
                                )
                            )
                        ],
                        []
                    )
                ],
                []
            )
        ])
    ]
}

// Display message while flow field is processed ---------------------------------
const traceLoadScreen = (STATE) => {
    const { seed, width, height, color, margin } = STATE
    const fntSz = [width * 0.009, height * 0.012]

    return [
        rect([width, height], { fill: color }),
        group({ weight: 1.5, stroke: '#333' }, [
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
