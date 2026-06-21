import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
// import '../framed-canvas.css'
import '../full-canvas.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { charsGrid } from './charsGrid'
import state from './state'
import { pickRandom } from '@thi.ng/random'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let comp = [],
    frame = 0,
    loop = 0,
    nextChange = {},
    lastTime,
    currentTime,
    isRecording = false,
    isPlaying = true,
    mode = 'autonomous' // could also be 'static'

ROOT.appendChild(CANVAS)

const init = () => {
    state.initstate()
    const { SIZE } = state.constants
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    launch()
}

const launch = () => {
    cancelAnimationFrame(animate)
    frame = 0
    loop = 0
    requestChange()
    animate()
}

// Return
const requestChange = () => {
    const availableChanges = Object.keys(state.updateChoice)
    const NUM_FRAME = state.constants.NUM_FRAME
    nextChange = {
        delay:
            (frame + Math.floor(Math.random() * 0.2 * NUM_FRAME)) %
            (NUM_FRAME - 2),
        variation: 'colorAxis' //pickRandom(availableChanges)
    }
}

const animate = () => {
    const { NUM_FRAME, SIZE, FPS_INTERVAL, WEIGHT } = state.constants
    const { palette, text } = state.variations
    isPlaying && requestAnimationFrame(animate)
    currentTime = performance.now()
    if (!lastTime) lastTime = currentTime

    const elapsed = currentTime - lastTime
    if (!isPlaying || elapsed > FPS_INTERVAL) {
        if (frame === NUM_FRAME) {
            console.log('done')
            frame = 0
            if (mode === 'autonomous') loop++
            if (isRecording && mode === 'static') isPlaying = false
        }
        if (
            nextChange.delay &&
            mode === 'autonomous' &&
            frame === nextChange.delay &&
            nextChange.variation
        ) {
            state.updateChoice[nextChange.variation]()
            // console.log(nextChange.variation)
            requestChange()
        }

        if (frame)
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

        if (isPlaying && isRecording) {
            const filename =
                'SZ.' +
                (mode === 'static'
                    ? text.replace(/[^a-zA-Z0-9\s]/g, '') + '-'
                    : 'autonomous-') +
                String(frame + NUM_FRAME * loop).padStart(6, '0')
            downloadCanvas(CANVAS, filename, 'jpeg', 1)
        }
        lastTime = currentTime
        frame++
    }
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(
        CANVAS,
        `SZ.${state.text.replace(/[^a-zA-Z0-9\s]/g, '')}-${FMT_yyyyMMdd_HHmmss()}`,
        'jpeg',
        1
    )
}
window['exportSVG'] = () => {
    downloadWithMime(
        `SZ.${state.text.replace(/[^a-zA-Z0-9\s]/g, '')}-${FMT_yyyyMMdd_HHmmss()}.svg`,
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

        case 'l':
            console.log(
                'nextChange',
                nextChange,
                ' frame',
                frame,
                'variation',
                state.variations
            )
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
