import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, SFC32 } from '@thi.ng/random'
import { polyline, transform, group, bounds } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import * as mat from '@thi.ng/matrices'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SCHEMES from './schemes'
import { seedFromHash } from './seed-from-hash'
import { getParagraphVector } from '@nclslbrn/plot-writer'
import hashes from './hashes'
const { floor, ceil } = Math

const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))

    return resolve(
        {
            ...config,

            RND,

            theme: () => {
                const [themeName, colors] = structuredClone(
                    pickRandom(SCHEMES, RND)
                )
                const bgColor = colors.shift()
                return [
                    themeName,
                    [bgColor, ...colors.sort(() => RND.float() > 0.5)]
                ]
            },

            areCellsDupplicated: () => RND.float() > 0.75,

            gridSize: () => [
                6 + ceil(RND.float() * 8),
                8 + ceil(RND.float() * 8)
            ],

            cropPoly: ({ margin, width, height }) => [
                [margin, margin],
                [width - margin, margin],
                [width - margin, height - margin],
                [margin, height - margin]
            ],

            ruleIdx: () => floor(RULES.length * RND.float()),

            rotation: () => (Math.PI * RND.minmaxInt(-4, 4)) / 8,

            skewType: () => pickRandom(['skewY23', 'skewX23'], RND),

            cells:
                () =>
                (numCell, not = []) => {
                    const choices = Array.from(Array(GRIDS.length))
                        .map((_, i) => i)
                        .filter((idx) => !not.includes(idx))

                    const gridTypeIdx = floor(RND.float() * choices.length)
                    return [
                        choices[gridTypeIdx],
                        GRIDS[choices[gridTypeIdx]](numCell, () => RND.float())
                    ]
                },

            pattern: ({ gridSize, cells }) => {
                const [patternType, pattern] = cells(gridSize[0], [])
                return {
                    type: patternType,
                    elem: pattern
                }
            },

            grid: ({ gridSize, cells, pattern }) => {
                const [_, grid] = cells(gridSize[1], [pattern.type])
                return grid
            }
        },
        { onlyFnRefs: true }
    )
}

const resolveState = (config) =>
    resolve(
        {
            ...BASE(config),
            ...config,

            rule: ({ ruleIdx }) => RULES[ruleIdx],

            patternCells: ({ grid, pattern, rule, areCellsDupplicated }) => {
                const cells = [[], []]

                for (let i = 0; i < grid.length; i++) {
                    const [x, y, w, h] = grid[i]
                    for (let j = 0; j < pattern.elem.length; j++) {
                        const [dx, dy, dw, dh] = pattern.elem[j]

                        const patternCell = [
                            x + dx * w,
                            y + dy * h,
                            dw * w,
                            dh * h
                        ]

                        if (!rule(i, j) || areCellsDupplicated) {
                            cells[0].push(patternCell)
                        } else {
                            cells[1].push(patternCell)
                        }
                    }
                }
                if (areCellsDupplicated) cells[1] = [...cells[0]]

                return cells
            },

            skewAngles: ({ patternCells }) =>
                patternCells.map((_, i) => (Math.PI / 8) * (i % 2 ? -1 : 1)),

            hashes: ({
                patternCells,
                width,
                height,
                skewAngles,
                skewType,
                theme,
                RND
            }) =>
                patternCells.map((layer, i) =>
                    transform(
                        group(
                            {
                                stroke: theme[1][(i + 1) % theme[1].length],
                                weight: 1
                            },
                            layer.reduce((lines, cell, j) => {
                                // Scale cell dimensions first before generating hashes
                                const [x, y, w, h] = cell
                                const scaledCell = [
                                    x * width,
                                    y * height,
                                    w * width,
                                    h * height
                                ]

                                return [
                                    ...lines,
                                    ...transform(
                                        group(
                                            {},
                                            hashes(
                                                scaledCell,
                                                RND.minmaxInt(0, 3),
                                                RND.minmaxInt(1, 3) * 8
                                            ).map((line) => polyline(line))
                                        ),
                                        mat.concat(
                                            [],
                                            mat[skewType](
                                                null,
                                                j % 4 === 0
                                                    ? skewAngles[j % 2]
                                                    : 0
                                            ),
                                            mat.scale23(null, [1.15, 1.15])
                                        )
                                    ).children
                                ]
                            }, [])
                        ),
                        mat[skewType](null, skewAngles[i])
                    )
                ),

            compBounds: ({ hashes }) => bounds(group({}, hashes)),

            groupedElems: ({
                hashes,
                cropPoly,
                width,
                height,
                skewAngles,
                rotation
            }) =>
                hashes
                    .map((group, i) =>
                        transform(
                            group,
                            mat.concat(
                                [],

                                mat.translation23(null, [
                                    width * 0.5,
                                    height * 0.5
                                ]),
                                mat.rotation23(null, rotation),

                                mat.translation23(null, [
                                    -width * 0.5,
                                    -height * 0.5
                                ]),
                                mat.scale23(null, [0.7, 0.7]),
                                mat.translation23(null, [
                                    width * 0.15,
                                    height * 0.15
                                ])
                                // mat.translation23(null, [width * 0.33, height * 0.33])
                            )
                        )
                    )
                    .map((hashGroup) =>
                        group(
                            hashGroup.attribs,
                            hashGroup.children.reduce(
                                (crp, l) => [
                                    ...crp,
                                    ...clipPolylinePoly(l.points, cropPoly).map(
                                        (pts) => polyline(pts)
                                    )
                                ],
                                []
                            )
                        )
                    ),

            edMeta: ({ seed, rule, margin: m, width: w, height: h }) => {
                const { vectors: seedV } = getParagraphVector(
                    seed,
                    72,
                    0,
                    0.5,
                    [1, 0.6]
                )
                const { vectors: ruleV } = getParagraphVector(
                    rule.toString(),
                    72,
                    0,
                    0.5,
                    [1, 0.6]
                )
                return [
                    ...seedV.reduce(
                        (acc, glyph) => [
                            ...acc,
                            ...glyph.map((line) =>
                                polyline(
                                    line.map(([x, y]) => [
                                        m + x * w,
                                        h - m * 0.8 + y * h
                                    ])
                                )
                            )
                        ],
                        []
                    ),
                    ...ruleV.reduce(
                        (acc, glyph, i) => [
                            ...acc,
                            ...glyph.map((line) =>
                                polyline(
                                    line.map(([x, y]) => [
                                        m - (glyph.length - i) + x * w,
                                        h - m * 0.8 + y * h
                                    ])
                                )
                            )
                        ],
                        []
                    )
                ]
            }
        },
        { onlyFnRefs: true }
    )

export { resolveState }
