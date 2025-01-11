import { rect, group, polyline, polygon } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { traceShape } from './traceShape'

// Trace flow trails ------------------------------------------------------------
const trace = (STATE) => {
    const { width, height, inner, trails, colors, margin, shapes } = STATE
    const domainScale = 0.95
    const cropPoly = [
        [margin, margin],
        [width - margin, margin],
        [width - margin, height - margin * 1.33],
        [margin, height - margin * 1.33]
    ]
    const fntSz = [width * 0.009, height * 0.017]
    const strokeById = (idx) =>
        colors[idx % 17 === 0 ? 3 : idx % 43 === 0 ? 4 : 1]

    const lines = trails.reduce((acc, line, idx) => {
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
    /*const isoShapes = shapes.reduce((l, shape) => {
        const s = traceShape(shape, [width*.5, height*.5])
        return [
            ...l,
            polygon(s.top, { fill: `${colors[0]}aa`}),
            polygon(s.bottom, { fill: `${colors[1]}33`}),
            polygon(s.left, { fill: `${colors[2]}cc`}),
            polygon(s.right, { fill: `${colors[3]}66`})
        ]
    }, [])
    */
   return comp(lines, fntSz, STATE)
}

const comp = (
    uniqueLines,
    fntSz,
    { width, height, colors, seed, attractor, operator, margin } = STATE
) => [
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
                        width - margin - fntSz[0] * 26.4 + fntSz[0] * x * 1.1,
                        height - margin
                    ]).map((vecs) => polyline(vecs))
                ],
                []
            )
        ),
        // the flow fields trails
        ...uniqueLines,
        // group({ stroke: colors[1] }, isoShapes)
    ])
]
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
