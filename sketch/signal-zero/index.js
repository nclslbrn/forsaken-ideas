import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
// import '../framed-canvas.css'
import '../full-canvas.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { randMinMax } from '@thi.ng/vectors'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import {
    downloadCanvas,
    downloadWithMime
    //canvasRecorder
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
    PX_RATIO = window.devicePixelRatio,
    SIZE = [window.innerWidth, window.innerHeight].map((d) =>
        Math.floor(PX_RATIO * d)
    ),
    MARGIN = 60,
    MAX_COLS = Math.floor(SIZE[0] / 18),
    MAX_ROWS = Math.floor(SIZE[1] / 24),
    MAX_FPS = 30,
    FPS_INTERVAL = 1000 / MAX_FPS,
    NUM_FRAME = 260,
    BASE_SIZE = 54,
    WEIGHT = Math.max(...SIZE) > 1080 ? 2 : 1

let comp = [],
    state = {},
    frame = 1,
    lastTime,
    currentTime,
    isRecording = false,
    isPlaying = true // ,
// recorder = null

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const randText = pickRandom(TEXTS)
    const randRule = pickRandom(RULES)
    const [background, ...colors] = pickRandom(THEMES)
    const wave =
        '-/\\-/|v_____-/\\-///|\\__/\\---..___' +
        '-W\\//T\\/====  //\\___//  \\\\____  xx^yy' +
        '______________::::::::|||/\\___/..%..\\\\' +
        '== == === == == __ ____ _____ _____  []..'
    state = {
        randText,
        randRule,
        palette: {
            background,
            colors
        },
        partition: randPartition(randMinMax(null, 3, 5), MAX_COLS),
        fontSize: resizers[20], //pickRandom(resizers),
        wave,
        NUM_FRAME,
        MAX_COLS,
        MAX_ROWS,
        MARGIN,
        SIZE,
        BASE_SIZE
    }

    console.log(
        `%c ${randText} ${background}`,
        `background: ${background}; color: ${colors[0]}`
    )
    console.log(
        `%c ${String(state.fontSize)}`,
        `background: ${background}; color: ${colors[1]}`
    )
    launch()
}

const launch = () => {
    cancelAnimationFrame(animate)
    // if (isRecording) startRecording()
    frame = 1
    animate()
}

const animate = () => {
    isPlaying && requestAnimationFrame(animate)
    currentTime = performance.now()
    if (!lastTime) lastTime = currentTime
    // if (isRecording && frame === NUM_FRAME) stopRecording()
    if (frame === NUM_FRAME) {
        console.log('done')
        frame = 1
        isPlaying = false
    }

    const elapsed = currentTime - lastTime
    if (!isPlaying || elapsed > FPS_INTERVAL) {
        comp = [
            rect(SIZE, { fill: state.palette.background }),
            group(
                {
                    weight: WEIGHT,
                    strokeLinejoin: 'round',
                    strokeLinecap: 'round'
                },
                charsGrid(state, frame)
            )
        ]

        draw(CTX, group({}, comp))
        isPlaying &&
            isRecording &&
            downloadCanvas(
                CANVAS,
                `SZ.${state.randText.replace(/[^a-zA-Z0-9\s]/g, '')}-${String(frame).padStart(3, '0')}`,
                'jpeg',
                1
            )
        lastTime = currentTime
        frame++
    }
}
/*
const startRecording = () => {
    if (!isRecording) return
    recorder = canvasRecorder(
        CANVAS,
        `SZ.${state.randText.replace(/[^a-zA-Z0-9\s]/g, '')}-${FMT_yyyyMMdd_HHmmss()}.webm`,
        {
            mimeType: 'video/webm',
            fps: MAX_FPS
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
 */

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(
        CANVAS,
        `SZ.${state.randText.replace(/[^a-zA-Z0-9\s]/g, '')}-${FMT_yyyyMMdd_HHmmss()}`,
        'jpeg',
        1
    )
}
window['exportSVG'] = () => {
    downloadWithMime(
        `SZ.${state.randText.replace(/[^a-zA-Z0-9\s]/g, '')}-${FMT_yyyyMMdd_HHmmss()}.svg`,
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

        case 'p':
            isPlaying = !isPlaying
            frame = 1
            animate()
            break

        case 'r':
            // if (isRecording) stopRecording()
            isRecording = !isRecording
            isPlaying = true
            launch()
            break
    }
}
