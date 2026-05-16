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
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { charsGrid } from './charsGrid'
import TEXTS from './TEXTS'
import RULES from './RULES'
const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(25, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    MAX_COLS = 40,
    MAX_ROWS = 60

let animation = 0,
    comp = [],
    state = {},
    frame = 0,
    isRecording = false,
    recorder = null

ROOT.appendChild(CANVAS)
const { sin, PI, random, round, abs } = Math

const randPartition = (parts, size) => {
    const rands = Array.from(Array(parts)).map(() => random())
    const sum = rands.reduce((sum, val) => sum + val, 0)
    return rands.map((x) => round((x / sum) * size))
}

const randomTextSize = [
    () => 40,
    (x, y, frame) =>
        16 + abs(sin((((frame % 480) * 0.05 + y) / 24) * PI * 2) * 24),
    (x, y, frame) => 16 + abs(sin((frame + (y % 480)) * 0.05 + x) * 24)
]

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const randText = pickRandom(TEXTS)
    const randRule = pickRandom(RULES)
    const palette = getPalette()
    const wave =
        '-/\\-/|v_____-/\\-///|\\__/\\---___-W\\//T\\/====vi//\\___//\\\\____xx^xx#______________'
    state = {
        randText,
        randRule,
        palette: {
            ...palette,
            colors: palette.colors.sort(() => random() > 0.5)
        },
        partition: randPartition(randMinMax(3, 5), MAX_COLS),
        fontSize: pickRandom(randomTextSize),
        wave,
        MAX_COLS,
        MAX_ROWS,
        MARGIN,
        SIZE
    }
    console.log(state)
    launch()
}

const launch = () => {
    if (animation) cancelAnimationFrame(animate)
    if (isRecording) startRecording()
    frame = 0
    animate()
}

const animate = () => {
    const { palette } = state

    if (isRecording && frame >= 479) stopRecording()
    animation = requestAnimationFrame(animate)

    comp = [
        rect(SIZE, { fill: palette.background }),
        group({ weight: 3 }, charsGrid(state, frame))
    ]

    draw(CTX, group({ stroke: palette.colors[0] }, comp))
    frame++
}

const startRecording = () => {
    if (!isRecording) return
    recorder = canvasRecorder(
        CANVAS,
        `Signal zero-${FMT_yyyyMMdd_HHmmss()}.mp4`,
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
