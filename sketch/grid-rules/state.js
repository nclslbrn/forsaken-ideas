import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, SFC32 } from '@thi.ng/random'
import { polyline, transform, group } from '@thi.ng/geom'
import * as mat from '@thi.ng/matrices'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SCHEMES from './schemes'
import { seedFromHash } from './seed-from-hash'
import { getParagraphVector } from '@nclslbrn/plot-writer'
import hashes from './hashes'
const { floor, ceil } = Math

const remap = (n, start1, stop1, start2, stop2) =>
    ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2

const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))

    return resolve(
        {
            ...config,

            RND,

            theme: () => pickRandom(SCHEMES, RND),

            areCellsDupplicated: () => RND.float() > 0.75,

            gridSize: () => [
                6 + ceil(RND.float() * 16),
                8 + ceil(RND.float() * 16)
            ],

            ruleIdx: () => floor(RULES.length * RND.float()),

            // rotation: () => (Math.PI * RND.minmaxInt(-4, 4)) / 8,

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

            groupedElems: ({
                patternCells,
                skewType,
                width,
                height,
                skewAngles,
                theme,
                RND
            }) =>
                patternCells.map((layer, i) =>
                    transform(
                        group(
                            { stroke: theme[1][2] },
                            layer.reduce((lines, cell, j) => {
                                // Scale cell dimensions first before generating hashes
                                const [x, y, w, h] = cell
                                const scaledCell = [
                                    x * width,
                                    y * height,
                                    w * width,
                                    h * height
                                ]
                                console.log(i, lines.length)

                                return [
                                    ...lines,
                                    ...hashes(
                                        scaledCell,
                                        RND.minmaxInt(0, 3),
                                        5
                                    ).map((line) => polyline(line))
                                ]
                            }, [])
                        ),
                        mat.concat(
                            [],
                            mat.scale23(null, [0.5, 0.5]),
                            mat.translation23(null, [
                                width * 0.5,
                                height * 0.5
                            ]),
                            mat[skewType](null, skewAngles[i])
                            // mat.rotation23(null, rotation)
                            //mat.translation23(null, [width / 2, height / 2])
                        )
                    )
                ),

            edMeta: ({ rule, margin: m, width: w, height: h }) => {
                const { vectors, height: txtHeight } = getParagraphVector(
                    rule.toString(),
                    48,
                    0,
                    7,
                    [1, 0.6]
                )
                return vectors.reduce(
                    (acc, glyph) => [
                        ...acc,
                        ...glyph.map((line) =>
                            polyline(
                                line.map(([x, y]) => [
                                    m * 0.5 + x * w * 0.1,
                                    h - m * 0.5 + y * h * 0.1
                                ])
                            )
                        )
                    ],
                    []
                )
            }
        },
        { onlyFnRefs: true }
    )

export { resolveState }
