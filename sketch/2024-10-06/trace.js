import { rect, group, polyline, polygon } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector } from '@nclslbrn/plot-writer'

// Trace flow trails ------------------------------------------------------------
const trace = (STATE) => {
    const { width, height, inner, trails, colors, margin, domain } = STATE
    const domainScale = 0.95
    const cropPoly = [
        [margin, margin],
        [width - margin, margin],
        [width - margin, height - margin],
        [margin, height - margin]
    ]

    const strokeById = (idx) => {
        const x = idx % domain
        const y = Math.floor(idx / domain)
        const distFromCenter = Math.floor(
            Math.sqrt((x - domain / 2) ** 2 + (y - domain / 2) ** 2)
        )
        return colors[
            distFromCenter < 20 ? 2 + (distFromCenter % (colors.length - 2)) : 1
        ]
    }

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
            ...cropped.map((line, i) =>
                polyline(line, {
                    stroke: `${strokeById(idx)}`,
                    weight: 1
                })
            )
        ]
    }, [])

    return comp(lines, STATE)
}

const comp = (uniqueLines, { width, height, colors } = STATE) => [
    rect([width, height], { fill: colors[0] }),
    group({}, [...uniqueLines])
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
