import { rect, group, polyline, convexHull, polygon } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector, getParagraphVector } from '@nclslbrn/plot-writer'
import { add2 } from '@thi.ng/vectors'
import { pointInPolygon2 } from '@thi.ng/geom-isec'

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
    const scale = 0.95
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
        const txtToPlot = getParagraphVector(txt[1], 16, 4, labelWidth)
        const poly = txtToPlot.vectors.reduce(
            (polys, glyph) => [
                ...polys,
                ...glyph.map((vecs) =>
                    polyline(vecs.map((v) => add2([], v, txt[0])))
                )
            ],
            []
        )
        const paraHeight = txtToPlot.height
        const tickLength = labelWidth / 4
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
        return [...labelPolys, group({}, poly)]
    }, [])
    
    // https://docs.thi.ng/umbrella/geom/functions/convexHull.html
    const randTextsBounds = randTexts.map((group) => convexHull(group))

    // https://docs.thi.ng/umbrella/geom-isec/functions/pointInPolygon2.html
    const removeBoundsFromLine = (line) => {
        let out = [[]],
            lineIdx = 0,
            wasInside = false
        // Seems vec is never inside 
        // 1 - bounds are not well computed 
        // 2 - points are not inside the just cross it (between two vecs) 
        line.forEach((vec) => {
            const isInside = randTextsBounds.reduce(
                (isIn, poly) => isIn || pointInPolygon2(vec, poly),
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
        rect([width, height], { fill: color }),
        group({ weight: 0.5, stroke: '#333' }, [
            // bottom right label seed + attractor name + mixing formula
            group(
                {},
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
                {},
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
            ...randTextsBounds.map(bounds => polygon(bounds.points, { fill: '#FF333333'})),
            // the flow fields trails
            ...trails.reduce(
                (acc, line) => [
                    ...acc,
                    ...clipPolylinePoly(
                        line.map((pos) => [
                            width / 2 + pos[0] * inner[0] * scale,
                            height / 2 + pos[1] * inner[1] * scale
                        ]),
                        cropPoly
                    ).reduce(
                        (splitted, vecs) => [
                            ...splitted,
                            ...removeBoundsFromLine(vecs).map((cleaned) =>
                                polyline(cleaned)
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
