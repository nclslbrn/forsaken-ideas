//import '../framed-canvas.css'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, group, asSvg, svgDoc, polyline } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { repeatedly2d } from '@thi.ng/transducers'
import { draw } from '@thi.ng/hiccup-canvas'
import { intersectCube } from './intersectCube'
import { normalize, dot } from './vectorOp'
import { createNoise2D } from 'simplex-noise'

const SIZE = [1920, 1920],
    MARGIN = 50,
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { tan, random, PI, cos, sin, acos, min, max, atan2 } = Math,
    noise = createNoise2D(),
    W = SIZE[0] - MARGIN * 2,
    H = SIZE[1] - MARGIN * 2,
    RES = 32,
    aspectRatio = W / H,
    fov = PI / 3,
    origin = [0, 0, 0],
    maxLength = 5000

CANVAS.width = SIZE[0]
CANVAS.height = SIZE[1]
ROOT.appendChild(CANVAS)

let cubes, pts, idx, drawElems, lines

// Scene configuration
const light = {
    direction: normalize([1, -1, -1]),
    intensity: 1.0
}
const distance = (x, y) => {
    const px = ((2 * (x + 0.5)) / W - 1) * tan(fov / 2) * aspectRatio
    const py = (1 - (2 * (y + 0.5)) / H) * tan(fov / 2)
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

const setup = () => {
    drawElems = []
    idx = 0
    pts = [
        ...repeatedly2d(
            (x, y) => [
                MARGIN + (x * RES) + ((random()-.5) * RES *.5),
                MARGIN + (y * RES) + ((random()-.5) * RES *.5)
            ],
            W / RES,
            H / RES
        )
    ]
    cubes = [
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
    lines = []
    update()
}

const update = () => {

    for (let i = 0; i < min(4, pts.length - idx); i++) {
        const line = []
        let pos = pts[idx + i]
        let hit = distance(...pos)

        while (
            line.length < maxLength &&
            pos[0] > MARGIN &&
            pos[1] > MARGIN &&
            pos[0] < W &&
            pos[1] < H
        ) {
            let n = []
            if (hit) {
              const theta = atan2(hit.normal[1], hit.normal[0]),
                    phi = acos(hit.normal[2])
              n = [cos(theta) * sin(phi), sin(theta) * sin(phi)]
            } else {
              const sf = noise(pos[0] * 0.0003, pos[1] * 0.0003)
              n = [cos(sf), sin(sf)]
            }
            const speed = hit
                ? 1 - 0.8 * max(0, -dot(hit.normal, light.direction))
                : 0.1
            pos = [pos[0] + n[0] * speed, pos[1] + n[1] * speed]
            hit = distance(...pos)
            line.push(pos)
        }
        line.length && lines.push(polyline(line))
        idx++
    }
    drawElems = [
        rect(SIZE, { fill: 'white' }),
        group({ stroke: 'black', weight: 1, fill: 'rgba(0, 0, 0, 0)' }, lines)
    ]

    draw(CTX, group({}, drawElems))

    // Increment idx for animation
    if (idx < pts.length - 1) {
        requestAnimationFrame(update)
    } else {
        console.log('DONE')
    }
}
setup()


window['randomize'] = setup

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
