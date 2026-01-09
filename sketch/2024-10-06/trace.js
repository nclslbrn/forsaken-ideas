import { rect, group, polyline } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { pickRandom, weightedRandom } from '@thi.ng/random'

// Trace flow trails ------------------------------------------------------------
const trace = (STATE) => {
    const {
        width,
        height,
        inner,
        trails,
        colors,
        margin,
        domain,
        verticalColorAssignation,
        RND
    } = STATE
    const domainScale = 1.1
    const cropPoly = [
        [margin, margin],
        [width - margin, margin],
        [width - margin, height - margin],
        [margin, height - margin]
    ]

    const strokeById = (idx) => {
        const x = idx % domain[0]
        const y = Math.floor(idx / domain[0])
        const distFromCenter = Math.floor(
            Math.sqrt((x - domain[0] / 2) ** 2 + (y - domain[1] / 2) ** 2)
        )
        return colors[
            distFromCenter < 15
                ? 2 +
                  ((verticalColorAssignation
                      ? Math.round((y * 20) / domain[1])
                      : Math.round((x * 20) / domain[0])) %
                      (colors.length - 2))
                : 1
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
                    weight: weightedRandom(
                        [0.66, 0.75, 1, 1.25, 1.33, 1.66, 2, 3, 4],
                        [3, 3, 3, 2, 2, 2, 1, 1, 1],
                        RND
                    )
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
