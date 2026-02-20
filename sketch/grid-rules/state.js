import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, weightedRandom, SFC32 } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import { polyline, polygon, transform, scale, group3 } from '@thi.ng/geom'
import * as mat from '@thi.ng/matrices'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SENTENCES from './SENTENCES'
import SCHEMES from './schemes'
import { seedFromHash } from './seed-from-hash'
import { getParagraphVector } from '@nclslbrn/plot-writer'
import hashes from './hashes'
const { floor, ceil, min, max, round, abs } = Math

const remap = (n, start1, stop1, start2, stop2) =>
    ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2

const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))

    return resolve(
        {
            ...config,

            RND,

            str: () => [...pickRandom(SENTENCES, RND)],

            baseFontSize: () => 12 + floor(RND.float() * 16),

            fontSize: ({ baseFontSize }) => [
                baseFontSize,
                baseFontSize * floor(1 + RND.float() * 0.5)
            ],

            oneLetterPerCellChance: () => 0.66 + RND.float() * 0.33,

            textColorPerCell: () => RND.float() > 0.5,

            theme: () => {
                const origin = pickRandom(SCHEMES, RND)
                return [
                    origin[0],
                    origin[1].sort((_a, _b) => RND.float() > 0.5)
                ]
            },

            areCellsDupplicated: () => RND.float() > 0.75,

            gridSize: () => [
                6 + ceil(RND.float() * 16),
                8 + ceil(RND.float() * 16)
            ],

            ruleIdx: () => floor(RULES.length * RND.float()),

            rotation: () => (Math.PI * RND.minmaxInt(-4, 4)) / 8,

            skewType: () => pickRandom(['skewY23', 'skewX23'], RND),

            skewTransform: ({ width: w, height: h }) => ({
                skewY23: [
                    [w * 0.5, h * 0.2],
                    [w * 0.5, h * 0.8]
                ],
                skewX23: [
                    [w * 0.2, h * 0.5],
                    [w * 0.8, h * 0.5]
                ]
            }),

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
            },

            loopStep: ({ pattern }) => min(pattern.elem.length, 16)
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

            groupedElems: ({
                patternCells,
                skewType,
                width,
                height,
                skewTransform,
                rotation,
                theme
            }) =>
                patternCells.map((layer, i) =>
                    transform(
                        group3(
                            {},
                            layer.map(
                                ([x, y, w, h], j) =>
                                    polygon(
                                        [
                                            [x, y],
                                            [x + w, y],
                                            [x + w, y + h],
                                            [x, y + h],
                                            [x, y]
                                        ],
                                        {
                                            fill: `${theme[1][j % theme[1].length]}`
                                        }
                                    )
                                /*
                                hashes([x, y, w, h], 0, 0.0001).map((line) =>
                                    polyline(line)
                                )
                                */
                            )
                        ),
                        // order seems to be translate, rotate then scale
                        mat.concat(
                            [],

                            mat.translation23(null, [
                                width * 0.255,
                                height * 0.255
                            ]),

                            mat[skewType](
                                null,
                                (Math.PI / 8) * (i % 2 ? -1 : 1)
                            ),
                            mat.scale23(null, [width / 2, height / 2])

                            // mat.rotation23(null, rotation)

                            //mat.translation23(null, [width / 2, height / 2])

                            /*
                                mat.translation23(
                                    null,
                                    skewTransform[skewType][j % 2]
                                )
                                */
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
