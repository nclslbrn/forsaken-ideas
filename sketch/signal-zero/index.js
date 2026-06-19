import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import '../framed-canvas.css'
// import '../full-canvas.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { charsGrid } from './charsGrid'
import state from './state'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let comp = [],
    frame = 0,
    lastTime,
    currentTime,
    isRecording = false,
    isPlaying = true,
    mode = 'autonomous' // could also be 'static'

ROOT.appendChild(CANVAS)

const init = () => {
    state.initstate()
    const { SIZE } = state.constants
    const { randText, palette, partition, animation, colorSectionNum } =
        state.variations
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    console.log(state.variations)

    const debug = ` text: ${randText}
  bg: ${palette.background}
  animation: ${animation}
  partition: ${colorSectionNum}/${palette.colors.length}\r\n `
    console.log(
        palette.colors.reduce(
            (acc, col, i) => acc + `%c ${i === 0 ? debug : ''}██ ${col} \n`,
            ''
        ),
        ...palette.colors.map(
            (col) => `background: ${palette.background}; color: ${col}`
        )
    )
    launch()
}

const launch = () => {
    cancelAnimationFrame(animate)
    frame = 1
    animate()
}

// Return
const requestChange = () => {}

const animate = () => {
    const { NUM_FRAME, SIZE, FPS_INTERVAL, WEIGHT } = state.constants
    const { palette, randText } = state.variations
    isPlaying && requestAnimationFrame(animate)
    currentTime = performance.now()
    if (!lastTime) lastTime = currentTime
    if (frame === NUM_FRAME) {
        console.log('done')
        frame = 1
        if (isRecording) isPlaying = false
    }

    const elapsed = currentTime - lastTime
    if (!isPlaying || elapsed > FPS_INTERVAL) {
        comp = [
            rect(SIZE, { fill: palette.background }),
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
                `SZ.${randText.replace(/[^a-zA-Z0-9\s]/g, '')}-${String(frame).padStart(3, '0')}`,
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
            isRecording = !isRecording
            isPlaying = true
            launch()
            break

        case 'm':
            mode = mode === 'static' ? 'autonomous' : 'static'
            break

        case 'ArrowRight':
            state.updateChoice.animation(1)
            console.log('animationIdx', state.variations.animation)
            break

        case 'ArrowLeft':
            state.updateChoice.animation(-1)
            console.log('animationIdx', state.variations.animation)
            break

        default:
            console.log(e.key)
            break
    }
}
