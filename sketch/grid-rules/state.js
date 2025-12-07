import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, weightedRandom, SFC32 } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import { polyline } from '@thi.ng/geom'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SENTENCES from './SENTENCES'
import SCHEMES from './SCHEMES'
import { PATTERNS, arpeggio } from './arpeggio'
import { SYNTH_OPTIONS } from './Synths'
import { generateFreqSeq, FREQ_SEQ_TYPE } from './NOTES'
import { seedFromHash } from './seed-from-hash'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { fillCell } from './fillCell'

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

            fillType: () => () =>
                weightedRandom(
                    [0, 1, 2, 3, 4, 5, 6, 7],
                    [4, 4, 4, 4, 1, 1, 1, 1],
                    RND
                ),

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

            loopStep: ({ pattern }) => min(pattern.elem.length, 16),

            seqType: () => pickRandom(FREQ_SEQ_TYPE, RND),

            noNoteChance: 0.9,

            octaveSpan: 1,

            frequencies: ({ loopStep, seqType }) =>
                generateFreqSeq(loopStep, 48, seqType),

            arpPattern: () => pickRandom(PATTERNS, RND),

            notes: ({ pattern, loopStep, noNoteChance, frequencies }) =>
                pattern.elem
                    .reduce(
                        (acc, [x, y, w, h], idx) => [
                            ...acc,
                            {
                                velocity: 0.1 + round(100 * abs(w)) / 160,
                                duration: pickRandom([30, 60, 90], RND),
                                frequency: pickRandom(frequencies, RND),
                                synth:
                                    RND.float() > noNoteChance
                                        ? false
                                        : pickRandom(SYNTH_OPTIONS, RND)
                            }
                        ],
                        []
                    )
                    .filter((_, n) => n < loopStep),

            arpeggioSequence: ({ notes, arpPattern, octaveSpan, RND }) => {
                const maxDuration = max(...notes.map((n) => n.duration))
                const arpSynth = pickRandom(SYNTH_OPTIONS, RND)
                const arpStep = 8 * ceil(RND.float() * 8)
                return arpeggio(
                    notes.map((n) => ({
                        ...n,
                        duration: maxDuration / arpStep,
                        synth: arpSynth
                    })),
                    octaveSpan,
                    arpPattern
                )
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
            glyphGrid:
                ({ fontSize }) =>
                ([cx, cy, cw, ch]) => [
                    ...repeatedly2d(
                        (x, y) => [
                            cx + x * fontSize[0],
                            cy + y * fontSize[1],
                            fontSize[0],
                            fontSize[1]
                        ],
                        floor(cw / fontSize[0]),
                        floor(ch / fontSize[1])
                    )
                ],

            rule: ({ ruleIdx }) => RULES[ruleIdx],

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

            groupedElems: ({
                str,
                glyphGrid,
                pattern,
                patternCells,
                loopStep,
                fillType,
                oneLetterPerCellChance,
                theme,
                textColorPerCell,
                RND
            }) => {
                const groups = Array.from(Array(pattern.elem.length)).map(
                    (_) => []
                )

                patternCells[0].map((cells, j) => {
                    for (let k = 0; k < cells.length; k++) {
                        const stripeLines = fillCell(cells[k], fillType(), 0)
                        groups[j % loopStep].push(
                            ...stripeLines.map((ln) =>
                                polyline(ln, {
                                    stroke: theme[1][
                                        1 + (k % (theme[1].length - 1))
                                    ]
                                })
                            )
                        )
                    }
                })
                patternCells[1].map((cells, j) => {
                    for (let k = 0; k < cells.length; k++) {
                        if (RND.float() > oneLetterPerCellChance) {
                            const letter = getGlyphVector(
                                str[k % str.length],
                                [cells[k][2], cells[k][3]],
                                [cells[k][0], cells[k][1]]
                            )
                            const col = 1 + (k % (theme[1].length - 1))
                            groups[j % loopStep].push(
                                ...letter.map((ln) =>
                                    polyline(ln, { stroke: theme[1][col] })
                                )
                            )
                        } else {
                            const textGrid = glyphGrid(cells[k])
                            groups[j % loopStep].push(
                                ...textGrid.reduce(
                                    (polys, subcell, sbIdx) => [
                                        ...polys,
                                        ...getGlyphVector(
                                            str[(k + sbIdx) % str.length],
                                            [subcell[2], subcell[3]],
                                            [subcell[0], subcell[1]]
                                        ).map((ln) =>
                                            polyline(ln, {
                                                stroke: theme[1][
                                                    1 +
                                                        ((textColorPerCell
                                                            ? k
                                                            : sbIdx + k) %
                                                            (theme[1].length -
                                                                1))
                                                ]
                                            })
                                        )
                                    ],
                                    []
                                )
                            )
                        }
                    }
                })
                return groups
            }
        },
        { onlyFnRefs: true }
    )

export { resolveState }
