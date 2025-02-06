import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, group, asSvg, svgDoc, circle } from '@thi.ng/geom'
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
    { abs, tan, min, max, random, PI } = Math

let width, height, drawElems
let time = 0 // Add time for animation

ROOT.appendChild(CANVAS)

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const dots = []

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

    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
            const px =
                ((2 * (x + 0.5)) / width - 1) * tan(fov / 2) * aspectRatio
            const py = (1 - (2 * (y + 0.5)) / height) * tan(fov / 2)
            const direction = normalize([px, py, -1])

            let closest = Infinity
            let hit = null
            let hitCube = null

            for (const cube of cubes) {
                const intersection = intersectCube(origin, direction, cube)
                if (intersection && intersection.t < closest) {
                    closest = intersection.t
                    hit = intersection
                    hitCube = cube
                }
            }

            if (hit) {
                const diffuse = max(0, -dot(hit.normal, light.direction))
                const lighting = 0.2 + 0.8 * diffuse
                dots.push(circle([x + MARGIN, y + MARGIN], 0.5 + ((1 - lighting) * 1.5)))
            }
        }
    }

    drawElems = [
        rect(SIZE, { fill: 'white' }),
        group({ stroke: 'rgba(0, 0, 0, 0)', fill: 'black' }, dots)
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
