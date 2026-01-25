import { resolve } from '@thi.ng/resolve-map'
// import { SFC32 } from '@thi.ng/random'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import rules from './rules'
import grids from './grids'

const { floor, ceil, min, max, round, abs } = Math

const remap = (n, start1, stop1, start2, stop2) =>
    ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2

const BASE = (config) => {
    const RND = SYSTEM
    // const RND = new SFC32(seedFromHash(config.seed))

    return resolve(
        {
            RND,
            baseFontSize: () => 12 + floor(RND.float() * 16),
            gridSize: () => [
                6 + ceil(RND.float() * 8),
                8 + ceil(RND.float() * 6)
            ],
            ruleIdx: () => floor(rules.length * RND.float()),
            cells:
                () =>
                (numCell, not = []) => {
                    const choices = Array.from(Array(grids.length))
                        .map((_, i) => i)
                        .filter((idx) => !not.includes(idx))

                    const gridTypeIdx = floor(RND.float() * choices.length)
                    return [
                        choices[gridTypeIdx],
                        grids[choices[gridTypeIdx]](numCell, () => RND.float())
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

            rule: ({ ruleIdx }) => rules[ruleIdx],

            subcells: ({ grid, pattern, rule }) => {
                const cells = []
                const cellType = []
                for (let i = 0; i < grid.length; i++) {
                    const [x, y, w, h] = grid[i]
                    for (let j = 0; j < pattern.elem.length; j++) {
                        const [dx, dy, dw, dh] = pattern.elem[j]
                        const patternCell = [x + dx, y + dy, dw * w, dh * h]

                        if (!rule(i, j)) {
                            cells.push(patternCell)
                            cellType.push(1)
                        } else {
                            cells.push(patternCell)
                            cellType.push(0)
                        }
                    }
                }
                return {
                    cells,
                    cellType
                }
            }
        },
        { onlyFnRefs: true }
    )

export { resolveState }
