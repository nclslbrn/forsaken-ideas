import { rect, polyline, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, weightedRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { repeatedly2d } from '@thi.ng/transducers'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import RULES from './RULES'
import GRIDS from './GRIDS'
import SENTENCES from './SENTENCES'
import { generateFreqSeq, FREQ_SEQ_TYPE } from './NOTES'
import { fillCell } from './fillCell'
// import { scribbleLine } from './scribbleLine'
import { schemes } from './schemes'
import { FMOscillator, PWMOscillator, PWMOscillatorAdvanced } from './Synths'

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
    TEMPO = 100

MASTER.connect(AUDIO_CTX.destination)
MASTER.gain.value = 0.5

const remap = (n, start1, stop1, start2, stop2) =>
        ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2,
    { random, floor, ceil, min, round } = Math

let theme = [],
    notes = [],
    currNote = 0,
    isPlaying = false,
    elemsToDraw = [],
    groupedElems = [],
    oscType = null

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const str = [...SENTENCES[floor(random() * SENTENCES.length)]],
        baseFontSize = 12 + floor(random() * 16),
        fontSize = [baseFontSize, baseFontSize * floor(1 + random() * 0.5)],
        glyphGrid = ([cx, cy, cw, ch]) => [
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
        fillType = weightedRandom(
            [0, 1, 2, 3, 4, 5, 6, 7],
            [4, 4, 4, 4, 1, 1, 1, 1]
        ),
        textColorPerCell = random() > 0.5,
        oneLetterPerCellChance = 0.66 + random() * 0.33,
        oscType = random() > 0.5 ? 'FM' : 'PWM'

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

    /* AllCell three dmension Array
      [0] cells that match rule
      [1] cells that doesn't
      [0|1][n] indexed by sub grid cell index
    */
    const loopStep = min(pattern.length, 7)
    const patternCells = [
        Array.from(Array(loopStep)).map((_) => []),
        Array.from(Array(loopStep)).map((_) => [])
    ]

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
                patternCells[0][j % loopStep].push(patternCell)
            } else {
                patternCells[1][j % loopStep].push(patternCell)
            }
        }
    }
    patternCells[0].map((cells, j) => {
        for (let k = 0; k < cells.length; k++) {
            const stripeLines = fillCell(cells[k], fillType(), 0)
            groupedElems[j % loopStep].push(
                ...stripeLines.map((ln) =>
                    polyline(ln, {
                        stroke: theme[1][1 + (k % (theme[1].length - 1))]
                    })
                )
            )
        }
    })
    patternCells[1].map((cells, j) => {
        for (let k = 0; k < cells.length; k++) {
            if (random() > oneLetterPerCellChance) {
                const letter = getGlyphVector(
                    str[k % str.length],
                    [cells[k][2], cells[k][3]],
                    [cells[k][0], cells[k][1]]
                )
                const col = 1 + (k % (theme[1].length - 1))
                groupedElems[j % loopStep].push(
                    ...letter.map((ln) =>
                        polyline(ln, { stroke: theme[1][col] })
                    )
                )
            } else {
                const textGrid = glyphGrid(cells[k])
                groupedElems[j % loopStep].push(
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
                                                (theme[1].length - 1))
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

    const seqType = pickRandom(FREQ_SEQ_TYPE)
    console.log(
        'Generate ' +
            seqType +
            ' tone sequence to be played by an ' +
            oscType +
            ' oscillator'
    )
    const frequencies = generateFreqSeq(
        loopStep,
        48, //+ 11 * ceil(random() * 4),
        seqType
    )
    //.sort((_a, _b) => Math.random() > 0.5)

    notes = pattern
        .reduce(
            (acc, [x, y, w, h], idx) => [
                ...acc,
                {
                    velocity: round(100 * w) / 100,
                    duration: ceil(random() * 5) / 3,
                    frequency: pickRandom(frequencies)
                }
            ],
            []
        )
        .filter((_, n) => n < loopStep)
    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems.map((elems) => group({}, elems))
        ])
    )
}

const animate = () => {
    if (!isPlaying) return
    const secondsPerBeat = 60.0 / TEMPO
    const osc =
        oscType === 'PWM'
            ? new PWMOscillator(AUDIO_CTX)
            : new FMOscillator(AUDIO_CTX)
    osc.playNote(notes[currNote])
    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems
                .filter((_, n) => n !== currNote)
                .map((elems) => group({}, elems))
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
        AUDIO_CTX.resume()
    } else {
        AUDIO_CTX.suspend()
    }
}
document.getElementById('iconav').style.display = 'none'

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
