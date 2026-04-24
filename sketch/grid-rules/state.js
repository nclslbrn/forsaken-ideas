import { resolve } from '@thi.ng/resolve-map'
// import { SFC32 } from '@thi.ng/random'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import { rect } from '@thi.ng/geom'
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

            rule: ({ ruleIdx }) => rules[ruleIdx],

            patternCells: ({
                loopStep,
                grid,
                pattern,
                rule,
                margin,
                width,
                height
            }) => {
                // AllCell three dimensions Array
                // [0] cells that match rule
                // [1] cells that don't
                // inside both [0|1][n] cell indexed by sub grid cell index

                const cells = [
                    Array.from(Array(loopStep)).map((_) => []),
                    Array.from(Array(loopStep)).map((_) => [])
                ]

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

                        // console.log(pattern.elem[j], loopStep, patternCell)

                        if (!rule(i, j)) {
                            cells[0][j % loopStep].push(patternCell)
                        } else {
                            cells[1][j % loopStep].push(patternCell)
                        }
                    }
                }
                return cells
            },

            groupedElems: ({ pattern, patternCells, loopStep, RND }) => {
                const groups = Array.from(Array(pattern.elem.length)).map(
                    (_) => []
                )

                patternCells[0].map((cells, j) => {
                    for (let k = 0; k < cells.length; k++) {
                        const [x, y, w, h] = cells[k]
                        groups[k % loopStep].push(
                            rect([x, y], [w, h], { fill: '#fff' })
                        )
                    }
                })
                patternCells[1].map((cells, j) => {
                    for (let k = 0; k < cells.length; k++) {
                        const [x, y, w, h] = cells[k]
                        groups[k % loopStep].push(
                            rect([x, y], [w, h], { fill: '#555' })
                        )
                    }
                })
                return groups
            }
        },
        { onlyFnRefs: true }
    )

export { resolveState }
