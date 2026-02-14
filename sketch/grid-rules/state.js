import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, weightedRandom, SFC32 } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import { polyline, polygon, transform, scale } from '@thi.ng/geom'
import * as mat from '@thi.ng/matrices'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SENTENCES from './SENTENCES'
import SCHEMES from './schemes'
import { seedFromHash } from './seed-from-hash'

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

            gridSize: () => [
                6 + ceil(RND.float() * 8),
                8 + ceil(RND.float() * 6)
            ],

            ruleIdx: () => floor(RULES.length * RND.float()),

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

            patternCells: ({ grid, pattern, rule, margin, width, height }) => {
                const cells = [[], []]

                for (let i = 0; i < grid.length; i++) {
                    const [x, y, w, h] = grid[i]
                    for (let j = 0; j < pattern.elem.length; j++) {
                        const [dx, dy, dw, dh] = pattern.elem[j]

                        const patternCell = [
                            remap(x + dx * w, 0, 1, margin, width - margin),
                            remap(y + dy * h, 0, 1, margin, height - margin),
                            dw * w * (width - margin * 2),
                            dh * h * (height - margin * 2)
                        ]

                        if (!rule(i, j)) {
                            cells[0].push(patternCell)
                        } else {
                            cells[1].push(patternCell)
                        }
                    }
                }
                return cells
            },

            groupedElems: ({ patternCells, skewType }) =>
                patternCells.map((group) =>
                    group.map(([x, y, w, h], j) =>
                        transform(
                            polygon([
                                [x, y],
                                [x + w, y],
                                [x + w, y + h],
                                [x, y + h],
                                [x, y]
                            ]),
                            mat.concat(
                                [],
                                mat.translation23(null, [-w / 2, -h / 2]),
                                mat[skewType](
                                    null,
                                    (Math.PI / 8) * (j % 2 ? -1 : 1)
                                )
                            )
                        )
                    )
                )
        },
        { onlyFnRefs: true }
    )

export { resolveState }
