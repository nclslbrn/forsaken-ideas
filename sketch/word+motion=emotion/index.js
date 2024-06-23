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
// import { THEMES } from './THEMES'
import { set1, set2 } from './CHARS'
import sentences from './SENTENCES'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { $compile } from '@thi.ng/rdom'
import { getPalette } from '@nclslbrn/artistry-swatch'

const { floor } = Math

let state = {
        types: [],
        t: 2,
        alter: '',
        stop: 1,
        idx: false,
        fixedType: false,
        seq: false
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
    recorder = null,
    recordedFrame = 0

const FPS = 12,
    fontFace = new FontFace(
        'FiraCode-Regular',
        'url(./assets/FiraCode-Regular.otf)'
    ),
    windowFrame = document.getElementById('windowFrame'),
    diag = Math.hypot(window.innerWidth, window.innerHeight),
    cell = [diag * 0.0178, diag * 0.0452],
    margin = diag * 0.03

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
    palette = getPalette()

    state.types = [...repeatedly2d((x, y) => randType(y), ...colsRows)]
    gridLength = state.types.length
    ctx.scale(dpr, dpr)
    draw(ctx, comp())
    update()
}
// A list of function for altering the type grid
//
const alter = {
    slideDown: [
        (seq = false, idx = false) => {
            for (let x = 0; x < colsRows[0]; x++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && x !== idx)) {
                    for (let y = 0; y < colsRows[1]; y++) {
                        const top = y * colsRows[0] + x,
                            bottom =
                                (y < colsRows - 1 ? y + 1 : 0) * colsRows[0] +
                                x,
                            tType =
                                y === 0 && seq
                                    ? seq[idx % seq.length]
                                    : state.types[top],
                            bType = state.types[bottom]
                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => [colsRows[1], SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    slideUp: [
        (seq = false, idx = false) => {
            for (let x = 0; x < colsRows[0]; x++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && x !== idx)) {
                    for (let y = colsRows[1] - 1; y >= 0; y--) {
                        const top = y * colsRows[0] + x,
                            bottom =
                                (y === colsRows - 1 ? y + 1 : 0) *
                                    (colsRows[0] - 1) +
                                x,
                            tType = state.types[top],
                            bType =
                                y === colsRows[1] - 1 && seq
                                    ? seq[idx % seq.length]
                                    : state.types[bottom]
                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => [colsRows[1], SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    slideLeft: [
        (seq = false, idx = false) => {
            for (let y = 0; y < colsRows[1]; y++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && y !== idx)) {
                    const right = colsRows[0] * y + colsRows[0],
                        left = colsRows[0] * y,
                        lType = state.types[left]
                    state.types.splice(left, 1)
                    state.types.splice(
                        right,
                        0,
                        seq ? seq[idx % seq.length] : lType
                    )
                }
            }
        },
        () => [colsRows[0], SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    slideRight: [
        (seq = false, idx = false) => {
            for (let y = 0; y < colsRows[1]; y++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && y !== idx)) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        rType = state.types[right]

                    state.types.splice(right, 1)
                    state.types.splice(
                        left,
                        0,
                        seq ? seq[idx % seq.length] : rType
                    )
                }
            }
        },
        () => [colsRows[0], SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    fillLeftMidRow: [
        (seq = false, idx = false) => {
            const y = idx || Math.round(colsRows[1] / 2)
            const c = y * colsRows[0] + state.t
            state.types[c] = seq ? seq[idx % seq.length] : state.types[c - 1]
        },
        () => [colsRows[0], SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    fillRightMidRow: [
        (seq = false, idx = false) => {
            const y = idx || Math.round(colsRows[1] / 2)
            const c = y * colsRows[0] + (colsRows[0] - state.t - 1)
            state.types[c] = seq ? seq[idx % seq.length] : state.types[c - 1]
        },
        () => [colsRows[0], SYSTEM.minmaxInt(0, colsRows[1])]
    ],
    fillTopMidColum: [
        (seq = false, idx = false) => {
            const x = idx || Math.round(colsRows[0] / 2)
            const c = state.t * colsRows[0] + x
            const p =
                state.t > 0
                    ? (state.t - 1) * colsRows[0] + x
                    : colsRows[0] * (colsRows[1] - 1) + x
            state.types[c] = seq ? seq[idx % seq.length] : state.types[p]
        },
        () => [colsRows[1], SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    fillBottomMidColum: [
        (seq = false, idx = false) => {
            const x = idx || Math.round(colsRows[0] / 2)
            const c = (colsRows[1] - state.t - 1) * colsRows[0] + x
            const p =
                state.t === colsRows[1] - 1
                    ? colsRows[0] + x
                    : colsRows[0] * (state.t + 1) + x
            state.types[c] = seq ? seq[idx % seq.length] : state.types[p]
        },
        () => [colsRows[1], SYSTEM.minmaxInt(0, colsRows[0])]
    ],
    alert: [
        (seq = false, idx = false) => {
            const phrase = [
                    ...sentences[(seq ? seq.length : idx) % sentences.length]
                ],
                col = pickRandom(palette.colors),
                y = colsRows[0] * (idx || 0),
                x = Math.round((colsRows[0] - phrase.length) / 2)

            for (let i = 0; i < phrase.length; i++) {
                state.types[(y + x + i) % state.types.length] = [phrase[i], col]
            }
        },
        () => [3, SYSTEM.minmaxInt(0, sentences.length)]
    ]
}

const comp = () =>
    group({}, [
        rect(frame, { fill: palette.background }),
        group(
            {
                font: `${cell[1] * 0.66}px FiraCode-Regular`,
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
const randType = (idx = false) => [
    SYSTEM.float() > 0.5
        ? set1[idx ? idx % set1.length : SYSTEM.minmaxInt(0, set1.length)]
        : set2[idx ? idx % set2.length : SYSTEM.minmaxInt(0, set2.length)],
    palette.colors[(idx ? idx : state.t) % palette.colors.length]
]

const update = () => {
    if (isRecording) {
        if (recordedFrame === FPS * 60) {
            stopRecording()
        } else {
            recordedFrame++
        }
    }

    //clearTimeout(timerID)
    //timerID = window.setTimeout(() => {
    frameReqest = requestAnimationFrame(update)
    //}, 40)

    if (state.t >= state.stop) {
        state.t = 0
        state.alter = pickRandomKey(alter)
        const [max, idx] = alter[state.alter][1]()
        state.stop = SYSTEM.minmaxInt(1, max / 2)
        state.idx = idx
        //state.fixedType = SYSTEM.float() > 0.9
        state.seq =
            SYSTEM.float() > 0.5
                ? false
                : SYSTEM.float() > 0.5
                  ? [randType(false), randType(false), [' ', '#ffffff']]
                  : [
                        randType(frameReqest),
                        randType(frameReqest),
                        [' ', '#ffffff']
                    ]
    } else {
        //if (!state.fixedType) state.seq = [randType(false)]
        alter[state.alter][0](state.seq, state.idx)
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
    recordedFrame = 0
    recorder = canvasRecorder(cnvs, 'undetermined-type-grid', {
        mimeType: 'video/webm;codecs=vp9',
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

document.addEventListener('keypress', update)

fontFace.load().then(function (font) {
    document.fonts.add(font)
    init()
    infobox()
    handleAction()
})
