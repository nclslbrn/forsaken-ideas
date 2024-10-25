import {
    rect,
    polyline,
    circle,
    line,
    group,
    translate,
    rotate,
    scale,
    svgDoc
} from '@thi.ng/geom'
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
import { createNoise2D } from 'simplex-noise'
import remap from '../../sketch-common/remap'
import ease from '../../sketch-common/ease'
import SENTENCES from './johnfluo-text'
import Particle from './Particle'
import { repeatedly } from '@thi.ng/transducers'
import { dist } from '@thi.ng/vectors'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    SIZE = [1920, 1080],
    MARGIN = 300,
    PRE = 'En fait ',
    LETTER_TIME = 10, //50,
    TRANSITION = 3000

let currSentence = 0,
    width,
    height,
    drawElems,
    frameReqest,
    read = [],
    textHeights = [],
    prevDrawTime = performance.now(),
    particles = [],
    noise

ROOT.appendChild(CANVAS)

const init = () => {
    width = SIZE[0]
    height = SIZE[1]
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    if (drawElems) {
        cancelAnimationFrame(frameReqest)
    }
    noise = createNoise2D()
    storeCurrStr()
    update()
}
const randPointInPoly = (poly, t) => {
    const toSegment = t * (poly.points.length - 1)
    //return poly.points[Math.floor(toSegment)]

    const from = Math.floor(toSegment)
    const selected = [poly.points[from], poly.points[from + 1]]
    const angle = Math.atan2(
        selected[1][1] - selected[0][1],
        selected[1][0] - selected[0][0]
    )
    const len = dist(selected[0], selected[1])
    const at = toSegment % 1
    return [
        poly.points[from][0] * Math.cos(angle) * len * at,
        poly.points[from][1] * Math.sin(angle) * len * at
    ]
}

const storeCurrStr = () => {
    const str = PRE + SENTENCES[currSentence]
    const letters = getParagraphVector(
        str,
        26,
        10,
        SIZE[0] - MARGIN * 4.5,
        [1, 0.8]
    )
    textHeights = [letters.height, ...textHeights]
    const newPoly = letters.vectors.reduce(
        (polys, group) => [...polys, ...group.map((line) => polyline(line))],
        []
    )

    read = [newPoly, ...read]
    createParticle(newPoly)
}

const createParticle = (section) => {
    particles = [
        ...section.map((poly) => {
            const num = Math.ceil(100 + Math.random(200 * poly.points.length))
            return [
                ...repeatedly(
                    () => new Particle(randPointInPoly(poly, Math.random())),
                    num
                )
            ]
        }),
        ...particles
    ].reverse()
}

const nDisplace = (x, y, scale) => {
    const lc = Math.atan2(SIZE[1] / 2 - y, SIZE[0] / 2 - x)
    return noise(Math.cos(lc) * 800 * scale, Math.sin(lc) * 2400 * scale) * 15
}

const update = () => {
    if (currSentence < SENTENCES.length - 1) {
        frameReqest = requestAnimationFrame(update)
        const readTime = SENTENCES[currSentence].length * LETTER_TIME
        if (performance.now() - prevDrawTime >= readTime + TRANSITION) {
            if (read.length === 7) read.splice(6, 1)
            if (particles.length === 7) particles.splice(0, 1)
            currSentence++
            // create new text vectors
            storeCurrStr()
            prevDrawTime = performance.now()
        }

        // compute transition index
        let t = 0
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

        particles = particles.map((group) => group.filter((p) => p.age < p.dur))
        // update particles
        particles = particles.map((group) =>
            group.map((p) => {
                const n = nDisplace(...p.pos, 0.07)
                p.pos = [
                    p.pos[0] + Math.cos(n) * p.acc,
                    p.pos[1] + Math.sin(n) * p.acc
                ]
                p.age++
                return p
            })
        )

        // noise read text
        if (read.length > 0) {
            read = read.map((group, i) => {
                if (i === 0) return group
                return group.map((poly) =>
                    polyline(
                        poly.points.map((pt) => {
                            const n = nDisplace(...pt, 1)
                            return [
                                pt[0] + Math.cos(n) * 0.5,
                                pt[1] + Math.sin(n) * 0.5
                            ]
                        })
                    )
                )
            })
        }

        drawElems = [
            rect([width, height], { fill: '#111' }),
            line([0, height / 2], [width, height / 2]),
            line([width * 0.33, 0], [width * 0.33, height]),
            line([width * 0.66, 0], [width * 0.66, height]),

            ...read.map((strPoly, i) =>
                translate(
                    rotate(
                        translate(
                            scale(
                                group(
                                    {
                                        lineCap: 'round',
                                        weight: 2,
                                        stroke:
                                            i === 6
                                                ? `rgba(255,255,255, ${1 - t})`
                                                : 'white'
                                    },
                                    [
                                        polyline(
                                            [
                                                [0, -16],
                                                [120, -16]
                                            ],
                                            { stroke: '#ffffff33' }
                                        ),
                                        ...strPoly
                                    ]
                                ),
                                i === 0 ? 1 : 0.85
                            ),
                            // rotation offset
                            [i === 0 ? 0 : 60, 16]
                        ),
                        (i / 4) * Math.PI + (i === 0 ? 0 : (t * Math.PI) / 4)
                    ),
                    [
                        width * (i === 0 ? 0.66 : 0.33),
                        height / 2 - textHeights[i] / 2 + 64
                    ]
                )
            ),
            ...particles.map((partGroup, i) =>
                translate(
                    rotate(
                        translate(
                            scale(
                                group(
                                    {
                                        fill:
                                            i === 6
                                                ? `rgba(255,255,255, ${1 - t})`
                                                : 'white'
                                    },

                                    i > 0
                                        ? partGroup.map((p) =>
                                              circle(p.pos, (1 - p.acc) * 1.5)
                                          )
                                        : []
                                ),
                                i === 0 ? 1 : 0.85
                            ),
                            // rotation offset
                            [i === 0 ? 0 : 60, 16]
                        ),
                        (i / 4) * Math.PI + (i === 0 ? 0 : (t * Math.PI) / 4)
                    ),
                    [
                        width * (i === 0 ? 0.66 : 0.33),
                        height / 2 - textHeights[i] / 2 + 64
                    ]
                )
            )
        ]
    }
    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['download'] = () => {
    downloadCanvas(CANVAS, `En fait-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
/*
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
*/
window.infobox = infobox
handleAction()
