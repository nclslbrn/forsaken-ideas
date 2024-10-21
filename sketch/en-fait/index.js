import { rect, polyline, group, svgDoc } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import {
    downloadCanvas,
    downloadWithMime,
    canvasRecorder
} from '@thi.ng/dl-asset'
import { getParagraphVector } from '@nclslbrn/plot-writer'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import SENTENCES from './johnfluo-text'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    SIZE = [1920, 1080],
    MARGIN = 300,
    PRE = 'En fait ',
    LETTER_TIME = 30

let currSentence = 0,
    width,
    height,
    drawElems,
    frameReqest,
    prevDrawTime = performance.now()

ROOT.appendChild(CANVAS)
const randColor = () =>
    pickRandom(['tomato', 'steelblue', 'limegreen', 'indigo', 'gold'])

const init = () => {
    width = SIZE[0]
    height = SIZE[1]
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    update()
}

const update = () => {
    if (currSentence < SENTENCES.length - 1) {
        frameReqest = requestAnimationFrame(update)
        //console.log(`${prevDrawTime} - ${performance.now()}`)
        if (
            performance.now() - prevDrawTime >=
            SENTENCES[currSentence].length * LETTER_TIME
        ) {
            currSentence++
            prevDrawTime = performance.now()
        }

        const letters = getParagraphVector(
            PRE + SENTENCES[currSentence],
            24,
            5,
            SIZE[0] - MARGIN * 2
        )

        drawElems = [
            rect(SIZE, { fill: randColor() }),
            rect([width, height], { fill: '#111' }),
            group(
                { lineCap: 'round', weight: 2, stroke: 'white' },
                letters.vectors.reduce((polys, group) => [
                    ...polys,
                    ...group.map((line) => polyline(line))
                ], [])
            )
        ]
    }
    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `En fait-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `En fait-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, drawElems)
            )
        )
    )
}

window.infobox = infobox
handleAction()
