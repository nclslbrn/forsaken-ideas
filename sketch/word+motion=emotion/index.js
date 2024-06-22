import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandom, pickRandomKey } from '@thi.ng/random'
import { downloadCanvas, canvasRecorder } from '@thi.ng/dl-asset'
//import { downloadCanvas } from '@thi.ng/dl-asset'
import { group, text, rect } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'
import { button, canvas, div } from '@thi.ng/hiccup-html'
import { reactive } from '@thi.ng/rstream'
import { adaptDPI } from '@thi.ng/canvas'
import { THEMES } from './THEMES'
import { set1, set2 } from './CHARS'
import sentences from './SENTENCES'
import { repeatedly2d } from '@thi.ng/transducers'
import { $compile } from '@thi.ng/rdom'
//import { getPalette } from '@nclslbrn/artistry-swatch'

const { floor } = Math

let state = {
        types: [],
        t: 2,
        alter: '',
        stop: 1,
        idx: false,
        char: false,
        fixedType: false
    },
    frame = [0, 0],
    frameReqest = null,
    cnvs = null,
    padding = [0, 0],
    inner = [0, 0],
    colsRows = [0, 0],
    ctx = null,
    dpr = 1,
    palette = false,
    timerID = null,
    gridLength = 0,
    isRecording = reactive(false),
    recorder = null

const FPS = 12,
    windowFrame = document.getElementById('windowFrame'),
    diag = Math.hypot(window.innerWidth, window.innerHeight),
    cell = [diag * 0.0258, diag * 0.0305],
    margin = diag * 0.05

const init = () => {
    if (state.types.length) {
        stopRecording()
        cancelAnimationFrame(timerID)
    }

    frame = [window.innerWidth, window.innerHeight]
    dpr = adaptDPI(cnvs, ...frame)
    inner = frame.map((d) => d - margin * 2)
    colsRows = inner.map((d, i) => floor(d / cell[i]))
    padding = inner.map((d, i) => (d - colsRows[i] * cell[i]) / 2)
    palette = pickRandom(THEMES)

    state.types = [
        ...repeatedly2d(
            (x, y) => [
                SYSTEM.float() > 0.5 ? ' ' : set2[x % set2.length],
                pickRandom(palette)
            ],
            ...colsRows
        )
    ]
    gridLength = state.types.length
    ctx.scale(dpr, dpr)
    draw(ctx, comp())
    update()
}
// A list of function for altering the type grid
//
const alter = {
    slideDown: [
        (type = false, idx = false) => {
            for (let x = 0; x < colsRows[0]; x++) {
                if ((!idx && SYSTEM.float() > 0.66) || (idx && x !== idx)) {
                    for (let y = 0; y < colsRows[1]; y++) {
                        const top = y * colsRows[0] + x,
                            bottom =
                                (y < colsRows - 2 ? y + 1 : 0) * colsRows[0] +
                                x,
                            tType = y === 0 && type ? type : state.types[top],
                            bType = state.types[bottom]
                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => [colsRows[1] / 2, SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    slideUp: [
        (type = false, idx = false) => {
            for (let x = 0; x < colsRows[0]; x++) {
                if ((!idx && SYSTEM.float() > 0.66) || (idx && x !== idx)) {
                    for (let y = colsRows[1] - 1; y >= 0; y--) {
                        const top = y * colsRows[0] + x,
                            bottom =
                                (y < colsRows - 2 ? y + 1 : 0) * colsRows[0] +
                                x,
                            tType = state.types[top],
                            bType =
                                y === colsRows[1] - 1 && type
                                    ? type
                                    : state.types[bottom]
                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => [colsRows[1] / 2, SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    slideLeft: [
        (type = false, idx = false) => {
            for (let y = 0; y < colsRows[1]; y++) {
                if ((!idx && SYSTEM.float() > 0.66) || (idx && y !== idx)) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        lType = state.types[left]
                    state.types.splice(left, 1)
                    state.types.splice(right, 0, type || lType)
                }
            }
        },
        () => [colsRows[0] / 2, SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    slideRight: [
        (type = false, idx = false) => {
            for (let y = 0; y < colsRows[1]; y++) {
                if ((!idx && SYSTEM.float() > 0.66) || (idx && y !== idx)) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        rType = state.types[right]

                    state.types.splice(right, 1)
                    state.types.splice(left, 0, type || rType)
                }
            }
        },
        () => [colsRows[0] / 2, SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    fillLeftMidRow: [
        (type = false, idx = false) => {
            const y = idx || Math.round(colsRows[1] / 2)
            const c = y * colsRows[0] + state.t
            state.types[c] = type || state.types[c - 1]
        },
        () => [colsRows[0], SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    fillRightMidRow: [
        (type = false, idx = false) => {
            const y = idx || Math.round(colsRows[1] / 2)
            const c = y * colsRows[0] + (colsRows[0] - state.t - 1)
            state.types[c] = type || state.types[c - 1]
        },
        () => [colsRows[0], SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    fillTopMidColum: [
        (type = false, idx = false) => {
            const x = idx || Math.round(colsRows[0] / 2)
            const c = state.t * colsRows[0] + x
            const p =
                state.t > 0
                    ? (state.t - 1) * colsRows[0] + x
                    : colsRows[0] * (colsRows[1] - 1) + x
            state.types[c] = type || state.types[p]
        },
        () => [colsRows[1], SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    fillBottomMidColum: [
        (type = false, idx = false) => {
            const x = idx || Math.round(colsRows[0] / 2)
            const c = (colsRows[1] - state.t - 1) * colsRows[0] + x
            const p =
                state.t === colsRows[1] - 1
                    ? colsRows[0] + x
                    : colsRows[0] * (state.t + 1) + x
            state.types[c] = type || state.types[p]
        },
        () => [colsRows[1], SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    alert: [
        (type = false, idx = false) => {
            const phrase = [...sentences[idx]],
                col = pickRandom(palette)
            const y = colsRows[0] * (idx || 0)

            for (let i = 0; i < phrase.length; i++) {
                state.types[(y + i) % state.types.length] = [phrase[i], col]
            }
        },
        () => [3, SYSTEM.minmaxInt(0, sentences.length)]
    ]
}

const comp = () =>
    group({}, [
        rect(frame, { fill: '#111114' }),
        group(
            {
                font: `${cell[0]}px monospace`,
                align: 'center',
                baseline: 'middle'
            },
            state.types.reduce((g, n, i) => {
                const x = i % colsRows[0],
                    y = floor(i / colsRows[0])
                return [
                    ...g,
                    text(
                        [
                            margin + padding[0] + x * cell[0] + cell[0] / 2,
                            margin + padding[1] + y * cell[1] + cell[1] / 2
                        ],
                        n[0],
                        { fill: n[1] }
                    )
                ]
            }, [])
        )
    ])
const randType = () =>
    SYSTEM.float() > 0.5
        ? [
              SYSTEM.float() > 0.3 ? pickRandom([...set1, ...set2]) : ' ',
              pickRandom(palette)
          ]
        : false

const update = () => {
    clearTimeout(timerID)
    timerID = window.setTimeout(() => {
        frameReqest = requestAnimationFrame(update)
    }, 50)

    if (state.t >= state.stop) {
        state.t = 0
        state.alter = pickRandomKey(alter)
        const [max, idx] = alter[state.alter][1]()
        state.stop = SYSTEM.minmaxInt(0, max)
        state.idx = idx
        state.fixedType = SYSTEM.float() > 0.33
        state.char = randType()
    } else {
        if (!state.fixedType) state.char = randType()
        alter[state.alter][0](state.char, state.idx)
        if (state.types.length > gridLength) {
            console.log(state.alter)
            cancelAnimationFrame(frameReqest)
        }
        state.t++
    }
    draw(ctx, comp())
}

// function to trigger canvas recording (if not yet active)
const startRecording = () => {
    if (isRecording.deref()) return
    recorder = canvasRecorder(cnvs, 'undetermined-type-grid', {
        mimeType: 'video/webm;codecs=vp8',
        fps: FPS
    })
    recorder.start()
    isRecording.next(true)
    console.log('%c Record started ', 'background: tomato; color: white')
}

// function to stop canvas recording (if active)
const stopRecording = () => {
    if (!isRecording.deref()) return
    recorder.stop()
    isRecording.next(false)
    console.log('%c Record stopped ', 'background: limegreen; color: black')
}

$compile(
    div(
        {},
        canvas('#main'),
        div(
            {
                style: 'position: absolute; right: 0; top: 0;'
            },
            button(
                {
                    disabled: isRecording,
                    onclick: startRecording,
                    title: 'start'
                },
                '🔴 start record'
            ),
            button(
                {
                    disabled: isRecording.map((x) => !x),
                    onclick: stopRecording,
                    title: 'stop'
                },
                '◼️ stop record'
            )
        )
    )
).mount(windowFrame)

cnvs = document.getElementById('main')
ctx = cnvs.getContext('2d')
window.init = init
window.onresize = init

init()
infobox()
handleAction()
