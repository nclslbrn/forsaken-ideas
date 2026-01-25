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
            ...config,
            margin: ({ width, height }) => {
                const baseMargin = RND.minmax(0.001, 0.05)
                return [baseMargin, (width / height) * baseMargin]
            },
            gridSize: () => [
                4, //6 + ceil(RND.float() * 8),
                4 //8 + ceil(RND.float() * 6)
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

            grid: ({ gridSize, cells, pattern, margin }) => {
                // const margin = 0.01
                const [_, baseGrid] = cells(gridSize[1], [pattern.type])
                const resized = baseGrid.map(([x, y, w, h]) => [
                    remap(x, 0, 1, margin[0], 1 - margin[0]),
                    remap(y, 0, 1, margin[1], 1 - margin[1]),
                    w * (1 - margin[0] * 2),
                    h * (1 - margin[1] * 2)
                ])

                return resized
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

            subcells: ({ grid, pattern, rule, RND }) => {
                const cells = []
                const cellType = []
                const lights = []
                for (let i = 0; i < grid.length; i++) {
                    const [x, y, w, h] = grid[i]
                    for (let j = 0; j < pattern.elem.length; j++) {
                        const [dx, dy, dw, dh] = pattern.elem[j]
                        const pCell = [x + dx, y + dy, dw * w, dh * h]

                        if (!rule(i, j)) {
                            cells.push(pCell)
                            cellType.push(1.0)
                        } else {
                            cells.push(pCell)
                            cellType.push(0.0)
                            if (RND.float() > 0.5) {
                                lights.push([
                                    RND.minmax(pCell[0], pCell[0] + pCell[2]),
                                    RND.minmax(pCell[1], pCell[1] + pCell[3]),
                                    5
                                ])
                            }
                        }
                    }
                }
                return {
                    cells,
                    cellType,
                    lights
                }
            }
        },
        { onlyFnRefs: true }
    )

export { resolveState }
