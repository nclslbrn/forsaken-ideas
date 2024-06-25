import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandomKey } from '@thi.ng/random'
import { downloadCanvas, canvasRecorder } from '@thi.ng/dl-asset'
import { group, text, rect } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'
import { button, canvas, div } from '@thi.ng/hiccup-html'
import { reactive } from '@thi.ng/rstream'
import { adaptDPI } from '@thi.ng/canvas'
import { set1, set2 } from './CHARS'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { $compile } from '@thi.ng/rdom'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { state, alter } from './alter'
import SENTENCES from './SENTENCES'

const { floor } = Math

let frame = [0, 0],
    frameReqest = null,
    cnvs = null,
    padding = [0, 0],
    inner = [0, 0],
    ctx = null,
    dpr = 1,
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
    cell = [diag * 0.0178, diag * 0.0452].map((d) => d * 1.5),
    margin = diag * 0.03

const init = () => {
    if (state.types.length) {
        stopRecording()
        cancelAnimationFrame(timerID)
    }

    frame = [window.innerWidth, window.innerHeight]
    dpr = adaptDPI(cnvs, ...frame)
    inner = frame.map((d) => d - margin * 2)
    state.colsRows = inner.map((d, i) => floor(d / cell[i]))
    padding = inner.map((d, i) => (d - state.colsRows[i] * cell[i]) / 2)
    state.palette = getPalette()
    state.types = [...repeatedly2d((x, y) => randType(x + y * state.colsRows[0]), ...state.colsRows)]

    state.modMotionLength = Math.min(...state.colsRows)
    // debug purpose variable
    gridLength = state.types.length
    ctx.scale(dpr, dpr)
    draw(ctx, comp())
    update()
}
const comp = () =>
    group({}, [
        rect(frame, { fill: state.palette.background }),
        group(
            {
                font: `${cell[1] * 0.66}px FiraCode-Regular`,
                align: 'center',
                baseline: 'middle'
            },
            state.types.reduce((g, n, i) => {
                const x = i % state.colsRows[0],
                    y = floor(i / state.colsRows[0])
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
    state.palette.colors[
        (idx ? idx % state.colsRows[0] : state.t) % state.palette.colors.length
    ]
]
const randSeq = (idx) => {
    return Array(...SENTENCES[idx % SENTENCES.length]).map((char) => [
        char,
        state.palette.colors[idx % state.palette.colors.length]
    ])
}

const update = () => {
    if (isRecording) {
        if (recordedFrame === FPS * 60) {
            stopRecording()
        } else {
            recordedFrame++
        }
    }

    clearTimeout(timerID)
    timerID = window.setTimeout(() => {
        frameReqest = requestAnimationFrame(update)
    }, 60)

    if (state.t >= state.stop) {
        state.t = 0
        state.alter = pickRandomKey(alter)
        const [maxFrame, maxItem] = alter[state.alter][1]()
        state.stop = SYSTEM.minmaxInt(1, maxFrame)
        state.idx = SYSTEM.minmaxInt(0, maxItem - 1)
        state.fixedType = SYSTEM.float() > 0.1
        state.seq = SYSTEM.float() > 0.9 ? randSeq(state.t) : false
    } else {
        if (!state.fixedType && state.t % 8 === 0) state.seq = randSeq(state.idx)
        alter[state.alter][0](state.seq, state.idx)
        if (state.types.length > gridLength) {
            console.log(state.alter)
            clearTimeout(timerID)
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
