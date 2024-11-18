import { rect, group, polyline } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector } from '@nclslbrn/plot-writer'

// Trace flow trails ------------------------------------------------------------
const trace = (STATE) => {
    const { width, height, trails, color, attractor, operator, margin } = STATE
    const scale = 0.95
    const cropPoly = [
        [margin, margin],
        [width - margin, margin],
        [width - margin, height - margin * 1.33],
        [margin, height - margin * 1.33]
    ]
    const inner = [width - margin * 2, height - margin * 2]
    const fntSz = [width * 0.009, height * 0.015]

    return [
        rect([width, height], { fill: color }),
        group({ weight: 1.5, stroke: '#333' }, [
            ...[
                ...window.seed,
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
            ),
            ...[...new Date().toISOString()].reduce(
                (poly, letter, x) => [
                    ...poly,
                    ...getGlyphVector(letter, fntSz, [
                        width - margin - fntSz[0] * 26.4 + fntSz[0] * x * 1.1,
                        height - margin
                    ]).map((vecs) => polyline(vecs))
                ],
                []
            ),
            ...trails.reduce(
                (acc, line) => [
                    ...acc,
                    ...clipPolylinePoly(
                        line.map((pos) => [
                            width / 2 + pos[0] * inner[0] * scale,
                            height / 2 + pos[1] * inner[1] * scale
                        ]),
                        cropPoly
                    ).map((pts) => polyline(pts))
                ],
                []
            )
        ])
    ]
}

// Display message while flow field is processed ---------------------------------
const traceLoadScreen = (STATE) => {
    const { width, height, color, margin } = STATE
    const fntSz = [width * 0.009, height * 0.012]

    return [
        rect([width, height], { fill: color }),
        group({ weight: 1.5, stroke: '#333' }, [
            ...[
                ...'generating ',
                ...window.seed,
            ].reduce(
                (poly, letter, x) => [
                    ...poly,
                    ...getGlyphVector(letter, fntSz, [
                        margin + fntSz[0] * x * 1.1,
                        height / 2
                    ]).map((vecs) => polyline(vecs))
                ],
                []
            ),
        ])
    ]
}
export { trace, traceLoadScreen }
