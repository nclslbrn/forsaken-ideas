import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { vec3, rotateX, rotateY, rotateZ } from './vectorOp'
import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'

const MAX_STEPS = 200,
    MAX_DIST = 200,
    SURFACE_DIST = 0.01,
    ITERATIONS = 1,
    SIZE = [1920, 2400],
    MARGIN = 120,
    ROOT = document.getElementById('windowFrame'),
    LOADER = document.getElementById('loading'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { PI, max, min, abs, round } = Math,
    clamp = (v, edg1, edg2) => min(edg2, max(edg1, v))

const rotateAll = (p) => {
    let rotated = rotateX(p, .1) //PI / 3)
    rotated = rotateY(rotated, PI / 4)
    rotated = rotateZ(rotated, PI/4)
    return rotated
}

const sdLimitRep = (p, s, l, sdf) => {
    const q = p.map(
        (v, i) => v / s[i] - s[i] * clamp(round(v / s[i]), -l[i], l[i])
    )
    return sdf(q, s)
}

const sdRep = (p, s, sdf) => {
    const q = p.map((v, i) => v - s[i] * round(v / s[i]))
    return sdf(q, s)
}

const sdBox = (p, b) => {
    const d = rotateAll(p).map((r, i) => abs(r) - b[i])
    return (
        min(max(d[0], max(d[1], d[2])), 0) +
        vec3.length([max(d[0], 0), max(d[1], 0), max(d[2], 0)])
    )
}

// Recursive Menger Sponge SDF
const mengerSponge = (p, iterations) => {
    // Apply rotation to the input point
    const rotated = rotateAll(p)
    const pfwd = [rotated[0], rotated[1], rotated[2] + 5] 
    let d = sdBox(pfwd, [3, 3, 3])
    
    let scale = 1
    for (let i = 0; i < iterations; i++) {
        scale *= 3
        const q = rotated.map((r) => abs((r * scale) % 3) - 1)
        const hole = min(max(q[0], q[1]), min(max(q[1], q[2]), max(q[0], q[2])))
        d = max(d, -hole / scale)
    }

    //d = max(d, sdBox(p, [7, 7, 7]))

    return d
}

// Calculate surface normal
const getNormal = (p) => {
    const eps = 0.001
    return vec3.normalize([
        mengerSponge([p[0] + eps, p[1], p[2]], ITERATIONS) -
            mengerSponge([p[0] - eps, p[1], p[2]], ITERATIONS),
        mengerSponge([p[0], p[1] + eps, p[2]], ITERATIONS) -
            mengerSponge([p[0], p[1] - eps, p[2]], ITERATIONS),
        mengerSponge([p[0], p[1], p[2] + eps], ITERATIONS) -
            mengerSponge([p[0], p[1], p[2] - eps], ITERATIONS)
    ])
}

// Raymarch function
const raymarch = (ro, rd) => {
    let dO = 0
    let hitPoint = null

    for (let i = 0; i < MAX_STEPS; i++) {
        const p = vec3.add(ro, vec3.mul(rd, dO))
        const dS = mengerSponge(p, ITERATIONS)

        if (dS < SURFACE_DIST) {
            hitPoint = p
            break
        }

        if (dO > MAX_DIST) break
        dO += dS
    }

    return { distance: dO, point: hitPoint }
}

// Generate flow field based contour lines
const generateContourLines = () => {
    const lines = []
    const gridSize = 50 // Increased for better coverage
    const camera = [0, 0, 0] // Moved camera back slightly
    const lineStepSize = 0.004
    const maxLineSteps = 140
    const width = SIZE[0] - MARGIN * 2
    const height = SIZE[1] - MARGIN * 2

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const startX = (i / gridSize) * 2 - 1
            const startY = (j / gridSize) * 2 - 1

            let path = []
            let currentPoint = [startX, startY, -.5]

            for (let step = 0; step < maxLineSteps; step++) {
                const rd = vec3.normalize([
                    currentPoint[0] - camera[0],
                    currentPoint[1] - camera[1],
                    currentPoint[2] - camera[2]
                ])

                const result = raymarch(camera, rd)

                if (result.point) {
                    const normal = getNormal(result.point)
                    const screenX = MARGIN + ((currentPoint[0] + 1) * width) / 2
                    const screenY =
                        MARGIN + ((currentPoint[1] + 1) * height) / 2

                    path.push([screenX, screenY])

                    currentPoint = vec3.add(currentPoint, [
                        normal[1] * lineStepSize,
                        -normal[0] * lineStepSize,
                        0
                    ])
                } else {
                    break
                }
            }

            if (path.length > 1) {
                lines.push(path)
            }
        }
    }

    return lines
}

let contours
const init = () => {
    contours = generateContourLines()
    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: '#fffefe' }),
            group(
                { stroke: '#000000cc', weight: 1.5, fill: 'rgba(0,0,0,0)' },
                contours.map((line) => polyline(line))
            )
        ])
    )
}

ROOT.removeChild(LOADER)
ROOT.appendChild(CANVAS)
CANVAS.width = SIZE[0]
CANVAS.height = SIZE[1]

init()

window.init = init
window.plot = () =>
    downloadWithMime(
        `sdf-to-svg${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `O O ${SIZE[0]} ${SIZE[1]}`
                },
                group(
                    {
                        stroke: 'black',
                        weight: 1,
                        fill: 'rgba(0,0,0,0)',
                        __inkscapeLayer: 'lines'
                    },
                    contours.map((line) => polyline(line))
                )
            )
        )
    )
window.capture = () =>
    downloadCanvas(CANVAS, `sdf-to-svg${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
window.infobox = infobox
handleAction()
