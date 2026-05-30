import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
// import '../framed-canvas.css'
import '../full-canvas.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { randMinMax } from '@thi.ng/vectors'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
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
    MAX_FPS = 25,
    FPS_INTERVAL = 1000 / MAX_FPS,
    NUM_FRAME = 260,
    BASE_SIZE = 54,
    WEIGHT = Math.max(...SIZE) > 1080 ? 2 : 1,
    COLOR_AXE = Math.random() > 0.5

console.log('RULES', RULES.length, 'SIZER', resizers.length)
let comp = [],
    state = {},
    frame = 1,
    lastTime,
    currentTime,
    isRecording = false,
    isPlaying = true,
    animationIdx = 0

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    animationIdx = Math.floor(Math.random() * resizers.length)
    const randText = pickRandom(TEXTS)
    const randRule = pickRandom(RULES)
    const [background, ...colors] = pickRandom(THEMES)
    const colorSectionNum = randMinMax(
        Math.floor(colors.length / 2),
        colors.length
    )
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
        partition: randPartition(
            colorSectionNum,
            COLOR_AXE ? MAX_COLS : MAX_ROWS
        ),
        fontSize: resizers[animationIdx], //pickRandom(resizers),
        wave,
        NUM_FRAME,
        MAX_COLS,
        MAX_ROWS,
        MARGIN,
        SIZE,
        BASE_SIZE,
        COLOR_AXE
    }

    const debug = 
` text: ${randText}
  bg: ${background}
  animation: ${animationIdx}
  partition: ${colorSectionNum}/${state.palette.colors.length}\r\n `
    console.log(
        state.palette.colors.reduce((acc, col, i) => acc + `%c ${i === 0 ? debug : ''}██ ${col} \n`, ''),
        ...state.palette.colors.map(
            (col) => `background: ${background}; color: ${col}`
        )
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
        if (isRecording) isPlaying = false
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
    switch (e.key) {
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

        case 'ArrowRight':
            animationIdx = (animationIdx + 1) % resizers.length
            state.fontSize = resizers[animationIdx]
            console.log('animationIdx', animationIdx)
            break

        case 'ArrowLeft':
            animationIdx--
            if (animationIdx < 0) animationIdx = resizers.length - 1
            state.fontSize = resizers[animationIdx]
            console.log('animationIdx', animationIdx)
            break
        default:
            console.log(e.key)
            break
    }
}
