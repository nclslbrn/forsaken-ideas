import '../framed-canvas.css'
import {
    rect,
    polyline,
    polygon,
    circle,
    line,
    group,
    translate,
    rotate,
    scale
} from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, canvasRecorder } from '@thi.ng/dl-asset'
import { getGlyphVector, getParagraphVector } from '@nclslbrn/plot-writer'
import { draw } from '@thi.ng/hiccup-canvas'
import { createNoise2D } from 'simplex-noise'
import { repeatedly } from '@thi.ng/transducers'
import remap from '../../sketch-common/remap'
import ease from '../../sketch-common/ease'
import SENTENCES from './johnfluo-text'
import Particle from './Particle'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    SIZE = [1920, 1080],
    MARGIN = 300,
    PRE = 'En fait ',
    LETTER_TIME = 12,
    TRANSITION = 100,
    COLORS = ['#FFFF33', '#33FFFF', '#FF33FF'],
    IS_RECORDING = false

let currSentence = 0,
    frameCount = 0,
    back = [],
    width,
    height,
    drawElems,
    frameReqest,
    read = [],
    particles = [],
    noise,
    cubes = [],
    recorder

ROOT.appendChild(CANVAS)

const norm2Hex = (x) =>
    `0${Math.round(255 * x).toString(16)}`.slice(-2).toUpperCase()

const init = () => {
    width = SIZE[0]
    height = SIZE[1]
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const wheelPos = [width * 0.33, height * 0.5]
    back = [
        rect([width, height], { fill: '#010101' }),
        circle(wheelPos, height * 0.4),
        ...[...'RÉSISTANCE'].reduce(
            (lines, c, i) => [
                ...lines,
                ...getGlyphVector(
                    c,
                    [24, 48],
                    [width * 0.25 + i * 32, 48]
                ).reduce((glyph, line) => [...glyph, polyline(line)], [])
            ],
            []
        ),
        ...[...'RÉSILIENCE'].reduce(
            (lines, c, i) => [
                ...lines,
                ...getGlyphVector(
                    c,
                    [24, 48],
                    [width * 0.25 + i * 32, height - 96]
                ).reduce((glyph, line) => [...glyph, polyline(line)], [])
            ],
            []
        ),
        ...[...'ENTROPIE'].reduce(
            (lines, c, i) => [
                ...lines,
                ...getGlyphVector(
                    c,
                    [24, 48],
                    [width * 0.71 + i * 32, height - 96]
                ).reduce((glyph, line) => [...glyph, polyline(line)], [])
            ],
            []
        ),
        ...repeatedly(
            (l) =>
                line(
                    [
                        wheelPos[0] + Math.cos(l * 0.06) * height * 0.4,
                        wheelPos[1] + Math.sin(l * 0.06) * height * 0.4
                    ],
                    [
                        wheelPos[0] +
                            Math.cos(l * 0.06) *
                                height *
                                (l % 5 === 0 ? 0.35 : 0.38),
                        wheelPos[1] +
                            Math.sin(l * 0.06) *
                                height *
                                (l % 5 === 0 ? 0.35 : 0.38)
                    ]
                ),
            Math.PI / 0.03
        )
    ]
    if (drawElems) {
        cancelAnimationFrame(frameReqest)
    }
    noise = createNoise2D()
    storeCurrStr()
    IS_RECORDING && startRecording()
    frameCount = 0
    update()
}

const storeCurrStr = () => {
    const str = PRE + SENTENCES[currSentence]
    const letters = getParagraphVector(
        str,
        20,
        10,
        SIZE[0] - MARGIN * 4.5,
        [1.2, 0.7]
    )
    const newPoly = letters.vectors.reduce(
        (polys, polyGroup, i) => [
            ...polys,
            ...polyGroup.map((line) =>
                polyline(line, {
                    stroke:
                        i < 7 ? COLORS[currSentence % COLORS.length] : '#ffffff'
                })
            )
        ],
        []
    )
    // text
    read = [newPoly, ...read]
    // particles
    if (read[1]) createParticle(read[1])
    // hid
    cubes = [
        ...repeatedly((y) => {
            const val = Math.random() * 9
            return [
                ...repeatedly((x) => {
                    const attribs =
                        val <= x ? { fill: '#010101' } : { fill: '#1c1c1c' }
                    return rect(
                        [width * 0.66 + x * 54, 100 + y * 54],
                        34,
                        attribs
                    )
                }, 9)
            ]
        }, 5).reduce((arr, curr) => [...arr, ...curr], [])
    ]
}

const createParticle = (polyGroup) => {
    particles = [
        [
            ...polyGroup.reduce(
                (parts, poly) => [
                    ...parts,
                    ...repeatedly(
                        () => [
                            ...poly.points.map(
                                (p) => new Particle(p, poly.attribs.stroke)
                            )
                        ],
                        Math.ceil(Math.random() * 17)
                    ).reduce((acc, val) => [...acc, ...val], [])
                ],
                []
            )
        ],
        ...particles
    ]
}

const nDisplace = (x, y, scale) => {
    const lc = Math.atan2(SIZE[1] * 0.5 - y, SIZE[0] * 0.33 - x)
    return noise(Math.cos(lc) * scale, Math.sin(lc) * scale)
}
// a function to transform text and rotation based on their index
const transform = (elem, i, t) =>
    translate(
        rotate(
            translate(
                scale(
                    group(
                        {
                            lineCap: 'round',
                            weight: 2
                        },
                        elem
                    ),
                    // scaling
                    i === 0 ? 1 : 0.8
                ),
                // translaton to offset the rotation
                [i === 0 ? 0 : 60, 36]
            ),
            // rotation
            (i / 4) * Math.PI + (i === 0 ? 0 : (t * Math.PI) / 4)
        ),
        // translation
        [width * (i === 0 ? 0.66 : 0.33), height * (i === 0 ? 0.33 : 0.5)]
    )

const update = () => {
    frameReqest = requestAnimationFrame(update)
    const readTime = SENTENCES[currSentence].length * LETTER_TIME
    if (frameCount >= readTime + TRANSITION) {
        if (read.length === 7) read.splice(6, 1)
        //if (particles.length === 7) particles.splice(6, 1)
        if (currSentence === SENTENCES.length - 1) {
            stopRecording()
            cancelAnimationFrame(frameReqest)
        } else {
            frameCount = 0;
            currSentence++
        }
        // create new text vectors
        storeCurrStr()
    }

    // compute transition index
    let t = 0
    if (frameCount >= readTime) {
        t = remap(
            frameCount - readTime,
            0,
            TRANSITION,
            0,
            1
        )
    }

    particles = particles.map((group) => group.filter((p) => p.age < p.dur))

    // update particles
    particles = particles.map((cycle) =>
        cycle.map((p) => {
            const n = nDisplace(...p.pos, 8)
            p.pos = [
                p.pos[0] + Math.cos(n) * (3.3 - p.acc) * -0.4,
                p.pos[1] + Math.sin(n) * (3.3 - p.acc) * -0.4
            ]
            p.age++
            return p
        })
    )

    // noise read text
    if (read.length > 0) {
        read = read.map((letter, i) => {
            if (i === 0) return letter
            return letter.map((poly) =>
                polyline(
                    poly.points.map((pt) => {
                        const n = nDisplace(...pt, 24)
                        return [
                            pt[0] + Math.cos(n) * -0.2,
                            pt[1] + Math.sin(n) * -0.2
                        ]
                    }),
                    poly.attribs
                )
            )
        })
    }
    drawElems = [
        ...back,
        ...cubes,
        ...read.map((letter, i) =>
            transform(
                i === 6
                    ? letter.map((poly) =>
                          polyline(poly.points, {
                              stroke: `${poly.attribs.stroke}${norm2Hex(1 - t)}`
                          })
                      )
                    : letter,
                i,
                ease(t, 15)
            )
        ),
        ...particles.map((cycle, i) =>
            transform(
                cycle.map((p) =>
                    circle(p.pos, p.acc * 0.5, {
                        stroke: `${p.color}${norm2Hex(1 - p.age / p.dur)}`,
                        fill: `${p.color}${norm2Hex(1 - p.age / p.dur)}`
                    })
                ),
                i + 1,
                t
            )
        ),
        polygon(
            [
                ...repeatedly(
                    (x) => [
                        width * 0.65 + x,
                        height * 0.87 -
                            nDisplace(x, 1, performance.now() * 0.0001, 0.07) *
                                25
                    ],
                    width * 0.25
                ),
                [width * 0.9, height * 0.9],
                [width * 0.65, height * 0.9]
            ],
            { fill: '#444', stroke: '#333' }
        )
    ]
    draw(CTX, group({ stroke: '#444', weight: 2 }, drawElems))
    frameCount++ 
}

const startRecording = () => {
    if (!IS_RECORDING) return
    recorder = canvasRecorder(CANVAS, 'en-fait', {
        mimeType: 'video/webm;codecs=vp9',
        fps: 30
    })
    recorder.start()
    console.log('%c Record started ', 'background: tomato; color: white')
}

// function to stop canvas recording (if active)
const stopRecording = () => {
    if (!IS_RECORDING) return
    recorder.stop()
    console.log('%c Record stopped ', 'background: limegreen; color: black')
}

window.init = init
init()

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
