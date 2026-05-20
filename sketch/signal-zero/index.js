import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import '../framed-canvas.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { randMinMax } from '@thi.ng/vectors'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import {
    downloadCanvas,
    downloadWithMime,
    canvasRecorder
} from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { charsGrid } from './charsGrid'
import { randPartition } from './partition'
import resizers from './resizers'
import TEXTS from './TEXTS'
import RULES from './RULES'
import THEMES from './THEMES'
const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    SIZE = [1280, 1280],
    MARGIN = 60,
    MAX_COLS = 75,
    MAX_ROWS = 35,
    MAX_FPS = 30,
    FPS_INTERVAL = 1000 / MAX_FPS,
    NUM_FRAME = 200,
    BASE_SIZE = 54

let animation = 0,
    comp = [],
    state = {},
    frame = 1,
    lastTime,
    currentTime,
    isRecording = false,
    recorder = null

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const randText = pickRandom(TEXTS)
    const randRule = pickRandom(RULES)
    const [background, ...colors] = pickRandom(THEMES).split(';:')
    const wave =
        '-/\\-/|v_____-/\\-///|\\__/\\---..___' +
        '-W\\//T\\/====vi//\\___//\\\\____xx^yy' +
        '______________::::::::|||/T\\___/A\\XW\\' +
        '=========== v_________________[]'
    state = {
        randText,
        randRule,
        palette: {
            background,
            colors
        },
        partition: randPartition(randMinMax(3, 5), MAX_COLS),
        fontSize: pickRandom(resizers),
        wave,
        NUM_FRAME,
        MAX_COLS,
        MAX_ROWS,
        MARGIN,
        SIZE,
        BASE_SIZE
    }
    console.log(String(state.fontSize))
    launch()
}

const launch = () => {
    if (animation) cancelAnimationFrame(animate)
    if (isRecording) startRecording()
    frame = 1
    animate()
}

const animate = () => {
    animation = requestAnimationFrame(animate)
    currentTime = performance.now()
    if (!lastTime) lastTime = currentTime
    if (isRecording && frame === NUM_FRAME) stopRecording()
    if (frame === NUM_FRAME) frame = 1

    const elapsed = currentTime - lastTime
    if (elapsed > FPS_INTERVAL) {
        comp = [
            rect(SIZE, { fill: state.palette.background }),
            group({ weight: 3 }, charsGrid(state, frame))
        ]

        draw(CTX, group({}, comp))
        lastTime = currentTime
        frame++
    }
}

const startRecording = () => {
    if (!isRecording) return
    recorder = canvasRecorder(
        CANVAS,
        `Signal zero-${FMT_yyyyMMdd_HHmmss()}.webm`,
        {
            mimeType: 'video/webm',
            fps: 30
        }
    )
    recorder.start()
    console.log('%c Record started ', 'background: tomato; color: white')
}

const stopRecording = () => {
    if (!isRecording) return
    recorder.stop()
    console.log('%c Record stopped ', 'background: limegreen; color: black')
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Signal zero-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Signal zero-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, comp.flat())
            )
        )
    )
}

window.infobox = infobox
handleAction()
window.onkeydown = (e) => {
    switch (e.key.toLowerCase()) {
        case 'n':
            init()
            break

        case 'd':
            window['exportJPG']()
            break

        case 's':
            window['exportJPG']()
            break

        case 'r':
            if (isRecording) stopRecording()
            isRecording = !isRecording
            launch()
            break
    }
}
