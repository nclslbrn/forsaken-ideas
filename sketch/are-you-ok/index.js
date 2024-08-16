import {
    rect,
    quad,
    group,
    svgDoc,
    ellipse,
    polyline,
    warpPoints,
    asSvg
} from '@thi.ng/geom'
import remap from '../../sketch-common/remap'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import {
    downloadCanvas,
    downloadWithMime,
    canvasRecorder
} from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { length, repeatedly2d } from '@thi.ng/transducers'
import { dist } from '@thi.ng/vectors'
import { convert, mul, quantity, NONE, mm, dpi } from '@thi.ng/units'
import { createNoise4D } from 'simplex-noise'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import sortClockwise from './sortClockwise'
import hatch from './hatch'
// default settings in inkscape DPI = 96
const DPI = quantity(250, dpi),
    SIZE = [1620, 1620],//2880], // mul(quantity([150, 266.666], mm), DPI).deref(),
    MARGIN = - 480, //convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    STEP = 96,
    N_SCALE = 0.000009,
    NUM_FRAME = 250, //240 -> 15sec
    SENTENCES = '01001100011100001111'//'infrathin' 
/*
  '─│┌┐└┘├┤┬┴┼╌╎'
  '↖←↑→↓↖↗↘↙↔↕↰↱↲↳↴↵'
  'structure' 
  'X↑↓O←→─│'
    'X↑↓O←→─│'
      'AreYouOK?'
    */
let frameCount = 0,
    isAnimated = false,
    isBusy = false,
    frameReqest,
    width,
    height,
    drawElems,
    noise,
    recorder,
    isRecording

ROOT.appendChild(CANVAS)

const collectNearest = (v, stack) =>
    sortClockwise([
        v,
        ...stack
            .filter((pt) => pt !== v)
            .sort((a, b) => dist(v, a) - dist(v, b))
            .slice(0, 3)
    ])

const init = () => {
    if (drawElems) {
        cancelAnimationFrame(frameReqest)
    }
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    noise = createNoise4D()
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    update()
}
const update = () => {
    if (isBusy) return
    isBusy = true
    if (isAnimated) frameReqest = requestAnimationFrame(update)
    if (frameCount === NUM_FRAME) {
        isRecording && stopRecording()
        frameCount = 0
    }
    // random points in sketch
    const [points1, points2] = [
        ...repeatedly2d(
            (x, y) => [MARGIN + STEP * x, MARGIN + STEP * y],
            width / STEP,
            height / STEP
        )
    ].reduce(
        (pts, p) => {
            const t = remap(frameCount, 0, NUM_FRAME, 0, 1) * Math.PI * 2
            const n1 = noise(
                p[0] * N_SCALE * STEP,
                p[1] * N_SCALE * STEP,
                0.33 * Math.cos(t),
                0.33 * Math.sin(t)
            )
            //if (n1 >= -0.15) {
                const a1 = Math.PI * n1
                return [
                    [
                        ...pts[0],
                        [
                            p[0] + Math.cos(a1) * STEP * n1 * 3,
                            p[1] + Math.sin(a1) * STEP * n1 * 3
                        ]
                    ],
                    pts[1]
                ]
            //}
            return [pts[0], [...pts[1], p]]
        },
        [[], []]
    )

    // points idx group
    const ptsToGroup = [...points1],
        ptsGroups = []
    for (let i = ptsToGroup.length - 1; i >= 4; i--) {
        const quadPoints = collectNearest(ptsToGroup[i], ptsToGroup)
        const nearEnough = quadPoints.reduce(
            (b, p, i, pts) =>
                b && dist(p, pts[(i + 1) % pts.length]) < STEP * 2.5,
            true
        )
        if (nearEnough) {
            ptsGroups.push(quadPoints)
        } else {
            points2.push(...quadPoints)
        }
        ptsToGroup.splice(i, 1)
    }
    /*
    const remaining = [
        ...points1.filter((p) => {
            return (
                ptsGroups.reduce(function (used, g) {
                    return used + (g.indexOf(p) === 1 ? 1 : 0)
                }, 0) !== 4
            )
        }),
        ...points2
    ]
    const extraQuads = []
    for (let i = remaining.length - 1; i >= 4; i--) {
        const quadPoints = collectNearest(remaining[i], remaining)
        const nearEnough = quadPoints.reduce(
            (b, p, i, pts) =>
                b && dist(p, pts[(i + 1) % pts.length]) < STEP * 4,
            true
        )
        if (nearEnough) {
            extraQuads.push(quadPoints)
        }
        remaining.splice(i, 1)
    }
    */

    const charsHatch = ptsGroups.map((g, i) =>
        /* i % 2 !== 0
            ? * getGlyphVector(SENTENCES[Math.floor((frameCount/NUM_FRAME) * SENTENCES.length)], [STEP, STEP]).map( */ 
            getGlyphVector(SENTENCES[i % SENTENCES.length], [STEP, STEP]).map(
                  (l) => warpPoints(l, quad(g), rect([STEP, STEP]), [])
              )
           /*: hatch(quad(g), Math.PI * 2 * [0.25, 0.5, 0.75, 1][(i / 8) % 4], 8) */
    )

    drawElems = [
        rect(SIZE, { fill: "#222433"}),
        group({ stroke: '#fff1fe' , weight: 2 }, [
            ...[...points1, ...points2].map((p) => ellipse(p, 3)),
            group(
                { lineCap: 'round', weight: 8 },
                charsHatch.reduce(
                    (acc, glyph) => [
                        ...acc,
                        ...glyph.map((line) => polyline(line))
                    ],
                    []
                )
            ),
            ...ptsGroups.map((g) => quad(...g)),
            //...extraQuads.map((g) => quad(...g))
        ])
    ]

    draw(CTX, group({}, drawElems))
    isBusy = false
    frameCount++
}

init()
window.init = init

window.exportJPG = () =>
    downloadCanvas(CANVAS, `Char in quad-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)

window.exportSVG = () =>
    downloadWithMime(
        `Char in quad-${FMT_yyyyMMdd_HHmmss()}.svg`,
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

window.onkeydown = (e) => {
    switch (e.key.toLowerCase()) {
        case ' ':
            isAnimated = !isAnimated
            update()
            break
        case 'd':
            window.exportJPG()
            break
        case 'p':
            window.exportSVG()
            break
        case 'g':
            window.init()
            break
        case 'r':
            startRecording()
            if (!isAnimated) {
                isAnimated = true
                update()
            }
            break
        case 's':
            stopRecording()
            break
        default:
            console.log(
                `No action assigned to key [${e.key}]. Press key: \n` +
                    `- [ ] (space) to play the animation \n` +
                    `- [d] to download a JPG \n` +
                    `- [p] for an SVG \n` +
                    `- [g] to regenerate another variation \n` +
                    `- [r] to start record \n`
            )
    }
}
const startRecording = () => {
    if (isRecording) return
    frameCount = 0
    recorder = canvasRecorder(CANVAS, 'structure', {
        mimeType: 'video/webm;codecs=vp9',
        fps: 25
    })
    recorder.start()
    isRecording = true
    console.log('%c Record started ', 'background: tomato; color: white')
}

// function to stop canvas recording (if active)
const stopRecording = () => {
    if (!isRecording) return
    if (isAnimated) isAnimated = false
    recorder.stop()
    isRecording = false
    console.log('%c Record stopped ', 'background: limegreen; color: black')
}
window.infobox = infobox
handleAction()
