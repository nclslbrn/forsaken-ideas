import { rect, polyline, group, translate, rotate, svgDoc } from '@thi.ng/geom'
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
import remap from '../../sketch-common/remap'
import ease from '../../sketch-common/ease'
import SENTENCES from './johnfluo-text'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    SIZE = [1920, 1080],
    MARGIN = 300,
    PRE = 'En fait ',
    LETTER_TIME = 50,
    TRANSITION = 3000,
    STR_ON_SCREEN = 7,
    COLOR = ['tomato', 'steelblue', 'limegreen', 'indigo', 'gold']

let currSentence = 0,
    width,
    height,
    drawElems,
    frameReqest,
    read = [],
    prevDrawTime = performance.now()

ROOT.appendChild(CANVAS)

const init = () => {
    width = SIZE[0]
    height = SIZE[1]
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    storeCurrStr()
    update()
}
const storeCurrStr = () => {
    const str = PRE + SENTENCES[currSentence]
    const letters = getParagraphVector(
        str,
        26,
        10,
        SIZE[0] - MARGIN * 4,
        [1, 0.8]
    )
    read = [
        letters.vectors.reduce(
            (polys, group) => [
                ...polys,
                ...group.map((line) => polyline(line))
        ],
        []),
        ...read
    ]

    console.log(read)
}

const update = () => {
    if (currSentence < SENTENCES.length - 1) {
        let t = 0
        frameReqest = requestAnimationFrame(update)
        const readTime = SENTENCES[currSentence].length * LETTER_TIME
        //console.log(`${prevDrawTime} - ${performance.now()}`)
        if (performance.now() - prevDrawTime >= readTime + TRANSITION) {
            if (read.length === 7) {
                read.splice(6, 1)
            }
            currSentence++
            storeCurrStr()
            prevDrawTime = performance.now()
        }

        if (performance.now() - prevDrawTime >= readTime) {
            t = ease(
                remap(
                    performance.now() - (prevDrawTime + readTime),
                    0,
                    TRANSITION,
                    0,
                    1
                ),
                15
            )
        }
        drawElems = [
            rect([width, height], { fill: '#111' }),
            ...read.map((strPoly, i) => 
                translate(
                    rotate(
                        translate(
                            group(
                                {
                                    lineCap: 'round',
                                    weight: 2,
                                    stroke: 'white'
                                },
                                [
                                    polyline(
                                        [
                                            [0, -16],
                                            [120, -16]
                                        ],
                                        { weight: 4 }
                                    ),
                                    ...strPoly
                                ]
                            ),
                            [MARGIN * (i === 0 ? 2 : 0.3), 0]
                        ),
                        (i / 4) * Math.PI + (i === 0 ? 0 : (t * Math.PI) / 4)
                    ),
                    [MARGIN * 2, MARGIN * (i === 0 ? 0.6 : 1.8)]
                )
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
