import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import '../framed-canvas.css'
import { rect, group, svgDoc, asSvg, polyline } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import {
    downloadCanvas,
    downloadWithMime,
    canvasRecorder
} from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { repeatedly } from '@thi.ng/transducers'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { textToStrokes } from './font'
import TEXTS from './TEXTS'
import RULES from './RULES'
import { randMinMax } from '@thi.ng/vectors'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(25, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let animation = 0,
    width = null,
    height = null,
    comp = [],
    state = {},
    frame = 0,
    isRecording = false,
    recorder = null

ROOT.appendChild(CANVAS)
const { sin, PI, random, round } = Math

const wave = '-/\\-/|v_____-/\\-///|\\__/\\---___-W\\//T\\/====vi//\\___//\\\\'

const randPartition = (parts, size) => {
    const rands = Array.from(Array(parts)).map(() => random())
    const sum = rands.reduce((sum, val) => sum + val, 0)
    return rands.map((x) => round((x / sum) * size))
}

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const randText = pickRandom(TEXTS)
    state = {
        randText: randText,
        randRule: pickRandom(RULES),
        palette: getPalette(),
        partition: randPartition(
            randMinMax(3, 5),
            randText.length + wave.length
        )
    }
    launch()
}

const launch = () => {
    if (animation) cancelAnimationFrame(animate)
    if (isRecording) startRecording()
    frame = 0
    animate()
}

const animate = () => {
    const { randRule, randText, palette, partition } = state

    if (isRecording && frame >= 479) stopRecording()
    animation = requestAnimationFrame(animate)

    comp = [
        rect(SIZE, { fill: palette.background }),

        ...repeatedly((lineNum) => {
            const suffix = wave
                .split('')
                .filter((_, i) => randRule(lineNum % i, (i % 3) * 4))
                .join('')
            const text = randText + suffix
            const grouped = partition.reduce((acc, length, gIdx, arr) => {
                const startIndex = arr
                    .slice(0, gIdx)
                    .reduce((sum, len) => sum + len, 0)
                const textPart = text.slice(startIndex, startIndex + length)
                textPart.length > 0 && acc.push(textPart)
                return acc
            }, [])

            let prevX = MARGIN
            return grouped.reduce((groups, textPart, gIdx) => {
                const size =
                    16 +
                    sin((((frame % 480) * 0.05 + lineNum) / 24) * PI * 2) * 24
                const lines = textToStrokes(textPart, {
                    x: prevX,
                    y: MARGIN + lineNum * 48,
                    size
                }).map((line) => polyline(line))
                prevX += size * textPart.length * 0.66
                return [
                    ...groups.flat(),
                    group(
                        {
                            stroke: palette.colors[
                                gIdx % palette.colors.length
                            ],
                            weight: 3
                        },
                        lines
                    )
                ]
            }, [])
        }, height / 48)
    ]
    draw(CTX, group({}, comp.flat()))
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
