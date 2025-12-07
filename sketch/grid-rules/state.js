import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, weightedRandom, SFC32 } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'

import RULES from './RULES'
import GRIDS from './GRIDS'
import { schemes } from './schemes'

import { generateFreqSeq, FREQ_SEQ_TYPE } from './NOTES'
import { SYNTH_OPTIONS } from './Synths'
import { seedFromHash } from './seed-from-hash'
import SENTENCES from './SENTENCES'
import { PATTERNS, arpeggio } from './arpeggio'

const { floor, ceil, min, max, round, abs } = Math

const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))
    const rule = RULES[floor(RULES.length * RND.float())]
    return resolve(
        {
            seed: config.seed,

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
                const origin = pickRandom(schemes, RND)
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

            fillType: () =>
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

            noNoteChance: 0.8,

            octaveSpan: 2,

            frequencies: ({ loopStep, seqType }) =>
                generateFreqSeq(loopStep, 48, seqType),

            arpPattern: () => pickRandom(PATTERNS, RND),

            notes: ({ pattern, loopStep, noNoteChance, frequencies }) =>
                pattern.elem
                    .reduce(
                        (acc, [x, y, w, h], idx) => [
                            ...acc,
                            {
                                velocity: 0.1 + round(100 * abs(w)) / 100,
                                duration: abs(
                                    (60 + ceil(RND.float() * 300)) * h
                                ),
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

            arpeggioSequence: ({ notes, arpPattern, octaveSpan }) => {
                const maxDuration = max(...notes.map((n) => n.duration))
                const arpSynth = pickRandom(SYNTH_OPTIONS)
                const arpStep = 4 * ceil(RND.float() * 8)
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

            rule: ({ ruleIdx }) => RULES[ruleIdx]
        },
        { onlyFnRefs: true }
    )

export { resolveState }
