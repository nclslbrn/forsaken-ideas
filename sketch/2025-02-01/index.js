import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, group, asSvg, svgDoc, circle, polyline } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { intersectCube } from './intersectCube'
import { normalize, dot } from './vectorOp'
const SIZE = [1200, 1200],
    MARGIN = 50,
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { abs, tan, min, max, random, PI, cos, sin, atan2 } = Math

let width, height, drawElems
let time = 0 // Add time for animation

ROOT.appendChild(CANVAS)

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const lines = []

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

    // Render the scene
    const aspectRatio = width / height
    const fov = PI / 3
    const origin = [0, 0, 0]

    for (let x = 0; x < width; x += 4) {
        for (let y = 0; y < height; y += 4) {
            const line = []
            let pos = [x + MARGIN, y + MARGIN]

            for (let z = -2; z <= 0; z += 0.1) {
                const px =
                    ((2 * (x + 0.5)) / width - 1) * tan(fov / 2) * aspectRatio
                const py = (1 - (2 * (y + 0.5)) / height) * tan(fov / 2)
                const direction = normalize([px, py, z])

                let closest = Infinity
                let hit = null

                for (const cube of cubes) {
                    const intersection = intersectCube(origin, direction, cube)
                    if (intersection && intersection.t < closest) {
                        closest = intersection.t
                        hit = intersection
                    }
                }

                if (hit) {
                    pos = [
                        pos[0] + cos(hit.normal[0] * PI * 2),
                        pos[1] + sin(hit.normal[1] * PI * 2)
                    ]
                    line.push(pos)
                    z += 0.5
                } else {
                    const toCenter = atan2(
                        (SIZE[1] * 0.5) - pos[1],
                        (SIZE[0] * 0.5) - pos[0]
                    )
                    pos = [ 
                      pos[0] + cos(toCenter) * 2, 
                      pos[1] + sin(toCenter) * 2
                    ]
                }
            }
            line.length && lines.push(polyline(line))
        }
    }

    drawElems = [
        rect(SIZE, { fill: 'white' }),
        group({ stroke: 'black', weight: 4, fill: 'rgba(0, 0, 0, 0)' }, lines)
    ]

    draw(CTX, group({}, drawElems))

    // Increment time for animation
    //time += 0.05;
    //requestAnimationFrame(init);
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
