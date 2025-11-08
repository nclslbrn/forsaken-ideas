import { rect, polyline, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, weightedRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'

import { getGlyphVector } from '@nclslbrn/plot-writer'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SENTENCES from './SENTENCES'
import { generateFreqSeq, FREQ_SEQ_TYPE } from './NOTES'
import { fillCell } from './fillCell'
import { scribbleLine } from './scribbleLine'
import { schemes } from './schemes'

const DPI = quantity(96, dpi),
    CUSTOM_FORMAT = quantity(
        [window.innerWidth / 20, window.innerHeight / 20],
        'cm'
    ),
    SIZE = mul(CUSTOM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(20, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    AUDIO_CTX = new AudioContext(),
    MASTER = AUDIO_CTX.createGain(),
    TEMPO = 120

MASTER.connect(AUDIO_CTX.destination)
MASTER.gain.value = 0.5

const remap = (n, start1, stop1, start2, stop2) =>
        ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2,
    { random, floor, ceil, min, round } = Math

let elemsDrawn = 200,
    theme = [],
    timer = 0,
    notes = [],
    currNote = 0,
    isPlaying = false,
    elemsToDraw = [],
    groupedElems = []

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const str = [...SENTENCES[floor(random() * SENTENCES.length)]],
        baseFontSize = 12 + floor(random() * 16),
        fontSize = [baseFontSize, baseFontSize * floor(1 + random() * 0.5)],
        glyphGrid = ([cx, cy, cw, ch]) =>
            repeatedly2d(
                (x, y) => [
                    cx + x * fontSize[0],
                    cy + y * fontSize[1],
                    fontSize[0],
                    fontSize[1]
                ],
                floor(cw / fontSize[0]),
                floor(ch / fontSize[1])
            ),
        fillType = weightedRandom(
            [0, 1, 2, 3, 4, 5, 6, 7],
            [4, 4, 4, 4, 1, 1, 1, 1]
        ),
        twoTone = random() > 0.5,
        textColorPerCell = random() > 0.5,
        oneLetterPerCellChance = 0.66 + random() * 0.33

    theme = pickRandom(schemes)
    theme[1] = theme[1].sort((_a, _b) => random() > 0.5)
    console.log(theme[0])

    const cells = (numCell, rand, not = []) => {
        const choices = Array.from(Array(GRIDS.length))
            .map((_, i) => i)
            .filter((idx) => !not.includes(idx))

        const gridTypeIdx = floor(random() * choices.length)
        return [
            choices[gridTypeIdx],
            GRIDS[choices[gridTypeIdx]](numCell, rand)
        ]
    }

    const rule = pickRandom(RULES)
    const grid_size = [6 + ceil(random() * 4), 8 + ceil(random() * 3)]
    const [patternType, pattern] = cells(grid_size[0], random)
    const [_, grid] = cells(grid_size[1], random, [patternType])
    groupedElems = Array.from(Array(pattern.length)).map((_) => [])

    const allCell = grid.reduce(
        (rects, cell, i) => {
            const [x, y, w, h] = cell
            const nested = pattern.reduce(
                (subgrid, pattern, j) => {
                    const [dx, dy, dw, dh] = pattern
                    const patternCell = [
                        remap(x + dx * w, 0, 1, MARGIN, SIZE[0] - MARGIN),
                        remap(y + dy * h, 0, 1, MARGIN, SIZE[1] - MARGIN),
                        dw * w * (SIZE[0] - MARGIN * 2),
                        dh * h * (SIZE[1] - MARGIN * 2)
                    ]
                    if (!rule(i, j)) {
                        return [[...subgrid[0], patternCell], subgrid[1]]
                    } else {
                        return [subgrid[0], [...subgrid[1], patternCell]]
                    }
                },
                [[], []]
            )
            return [
                [...rects[0], ...nested[0]],
                [...rects[1], ...nested[1]]
            ]
        },
        [[], []]
    )

    for (let i = 0; i < grid.length; i++) {
        const [x, y, w, h] = grid[i]
        for (let j = 0; j < pattern.length; j++) {
            const [dx, dy, dw, dh] = pattern[j]
            const patternCell = [
                remap(x + dx * w, 0, 1, MARGIN, SIZE[0] - MARGIN),
                remap(y + dy * h, 0, 1, MARGIN, SIZE[1] - MARGIN),
                dw * w * (SIZE[0] - MARGIN * 2),
                dh * h * (SIZE[1] - MARGIN * 2)
            ]
            if (!rule(i, j)) {
                groupedElems[j].push(
                    ...fillCell(patternCell, fillType(), 0).map((ln) =>
                        polyline(ln, {
                            stroke: theme[1][
                                1 + (j % (twoTone ? 2 : theme[1].length - 1))
                            ]
                        })
                    )
                )
            } else {
                if (random() > oneLetterPerCellChance) {
                    const letter = getGlyphVector(
                        str[(i + j) % str.length],
                        [patternCell[2], patternCell[3]],
                        [patternCell, patternCell[1]]
                    ).reduce(
                        (lns, ln) => [
                            ...lns,
                            polyline(ln, {
                                stroke: theme[1][
                                    1 +
                                        ((i + j) %
                                            (twoTone ? 2 : theme[1].length - 1))
                                ]
                            })
                        ],
                        []
                    )
                    letter.map((poly) => groupedElems[j].push(poly))
                } else {
                    const letters = glyphGrid(patternCell).map(
                        (subcell, sbIdx) =>
                            getGlyphVector(
                                str[(i + j + sbIdx) % str.length],
                                [subcell[2], subcell[3]],
                                [subcell[0], subcell[1]]
                            ).reduce(
                                (lns, ln, lnIdx) => [
                                    ...lns,
                                    polyline(ln, {
                                        stroke: theme[1][
                                            1 +
                                                ((textColorPerCell
                                                    ? i + j + lnIdx
                                                    : sbIdx + (i + j)) %
                                                    (twoTone
                                                        ? 2
                                                        : theme[1].length - 1))
                                        ]
                                    })
                                ],
                                []
                            )
                    )
                    letters.map((letter, lIdx) =>
                        letter.map((poly) =>
                            groupedElems[(j + lIdx) % groupedElems.length].push(
                                poly
                            )
                        )
                    )
                }
            }
        }
    }
    console.log(
        groupedElems.forEach((group) =>
            group.filter((elem) => elem.length !== undefined)
        )
    )
    const seqType = pickRandom(FREQ_SEQ_TYPE)
    console.log('Generate ' + seqType + ' tone sequence')
    const frequencies = generateFreqSeq(
        pattern.length,
        48 + 32 * ceil(random() * 4),
        seqType
    )
    //.sort((_a, _b) => Math.random() > 0.5)

    notes = pattern.reduce(
        (acc, [x, y, w, h], idx) => [
            ...acc,
            {
                attack: round(100 * x) / 200,
                sustain: round(100 * h) / 200,
                release: 0.5 + round(100 * w) / 200,
                len: 0.5 + round(100 * y) / 150,
                freq: pickRandom(frequencies) //[idx]
            }
        ],
        []
    )
    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            group({ __inkscapeLayer: theme[0] }, ...groupedElems)
        ])
    )
}

const playCurrentNote = (note) => {
    const osc = AUDIO_CTX.createOscillator()
    const enveloppe = AUDIO_CTX.createGain()
    enveloppe.gain.setValueAtTime(0, 0)
    enveloppe.gain.linearRampToValueAtTime(
        note.sustain,
        AUDIO_CTX.currentTime + note.len * note.attack
    )
    enveloppe.gain.setValueAtTime(
        note.sustain,
        AUDIO_CTX.currentTime + note.len - note.len * note.release
    ) // <- non finite value
    enveloppe.gain.linearRampToValueAtTime(0, AUDIO_CTX.currentTime + note.len)
    osc.type = 'sine' // square  sawtooth triangle sine
    osc.frequency.setValueAtTime(note.freq, 0)
    osc.start()
    osc.stop(AUDIO_CTX.currentTime + note.len)
    osc.connect(enveloppe)
    enveloppe.connect(MASTER)
}

const animate = () => {
    if (!isPlaying) return
    const secondsPerBeat = 60.0 / TEMPO
    playCurrentNote(notes[currNote])
    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            group(
                { __inkscapeLayer: theme[0] },
                ...groupedElems.filter((_, n) => n != currNote)
            )
        ])
    )
    currNote = (currNote + 1) % notes.length
    window.setTimeout(function () {
        animate()
    }, secondsPerBeat * 1000)
}

init()

window.init = init
CANVAS.onclick = function () {
    isPlaying = !isPlaying
    if (isPlaying) {
        animate()
    } else {
        AUDIO_CTX.suspend()
    }
}

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Grid rules-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Grid rules-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, elemsToDraw)
            )
        )
    )
}
document.addEventListener('keypress', (e) => {
    switch (e.key) {
        case 'r':
            window.init()
            animate()
            break
        case 'j':
            window.exportJPG()
            break
        case 's':
            window.exportSVG()
            break
    }
})
window.infobox = infobox
handleAction()
