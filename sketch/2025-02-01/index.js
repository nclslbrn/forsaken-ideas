//import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, group, asSvg, svgDoc, circle, polyline } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { intersectCube } from './intersectCube'
import { normalize, dot } from './vectorOp'
import { createNoise2D } from 'simplex-noise'

const SIZE = [1920, 1920],
    MARGIN = 50,
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { tan, random, PI, cos, sin, max, atan2 } = Math,
    noise = createNoise2D()

let width, height, drawElems
let time = 0 // Add time for animation

ROOT.appendChild(CANVAS)

// Scene configuration
const cubes = [
    {
        center: [0, 0, -5],
        size: 1,
        color: [255, 0, 0],
        rot: [random() * PI, random() * PI, random() * PI]
    },
    {
        center: [2, 0, -6],
        size: 1,
        color: [0, 255, 0],
        rot: [random() * PI, random() * PI, random() * PI]
    },
    {
        center: [-2, 0, -4],
        size: 2,
        color: [0, 0, 255],
        rot: [random() * PI, random() * PI, random() * PI]
    }
]

const light = {
    direction: normalize([1, -1, -1]),
    intensity: 1.0
}
const lines = []

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const distance = (x, y) => {
        const px = ((2 * (x + 0.5)) / width - 1) * tan(fov / 2) * aspectRatio
        const py = (1 - (2 * (y + 0.5)) / height) * tan(fov / 2)
        const direction = normalize([px, py, -1])

        let closest = Infinity
        let hit = null

        for (const cube of cubes) {
            const intersection = intersectCube(origin, direction, cube)
            if (intersection && intersection.t < closest) {
                closest = intersection.t
                hit = intersection
            }
        }
        return hit
    }

    const aspectRatio = width / height
    const fov = PI / 3
    const origin = [0, 0, 0]
    const maxPoint = 10000

    for (let i = 0; i < 16; i++) {
        const line = []
        let pos = [
          width*.5 + (random()-.5) * width, 
          height*.5 + (random()-.5) * height
        ]
        let hit = distance(...pos)

        while (
            //hit !== null &&
            line.length < maxPoint &&
            pos[0] > MARGIN &&
            pos[1] > MARGIN &&
            pos[0] < width &&
            pos[1] < height
        ) {
            const n = hit
                ? atan2(hit.normal[1], hit.normal[0])
                : noise(pos[0] * 0.0003, pos[1] * 0.0003)
            const speed = hit
                ? 1. - 0.8 * max(0, -dot(hit.normal, light.direction))
                : 0.1
            pos = [pos[0] + cos(n) * speed, pos[1] + sin(n) * speed]
            hit = distance(...pos)
            //console.log(`line #${i} ${line.length} points`)
            line.push(pos)
        }
        line.length && lines.push(polyline(line))
    }
    drawElems = [
        rect(SIZE, { fill: 'white' }),
        group({ stroke: 'black', weight: 1, fill: 'rgba(0, 0, 0, 0)' }, lines)
    ]

    draw(CTX, group({}, drawElems))

    // Increment time for animation
    if (time < 10000) {
        requestAnimationFrame(init)
        time++
    } else {
        console.log('DONE')
    }
}

init()

window['randomize'] = init

window['capture'] = () => {
    downloadCanvas(CANVAS, `2025 02 01-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}

window['download'] = () => {
    downloadWithMime(
        `2025 02 01-${FMT_yyyyMMdd_HHmmss()}.svg`,
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
