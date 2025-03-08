import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { vec3, rotateX, rotateY, rotateZ } from './vectorOp'
import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { hash13 } from './hash13'

const MAX_STEPS = 1000,
    MAX_DIST = 40,
    SURFACE_DIST = 5.0e-15,
    ITERATIONS = 5,
    SIZE = [1920, 2400],
    MARGIN = 120,
    ROOT = document.getElementById('windowFrame'),
    LOADER = document.getElementById('loading'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { PI, max, min, abs, floor, round, pow } = Math,
    clamp = (v, edg1, edg2) => min(edg2, max(edg1, v))

const rotateAll = (p) => {
    let rotated = rotateX(p, PI/4)
    rotated = rotateY(rotated, -PI/4)
    rotated = rotateZ(rotated, PI/4)
    return rotated
}

const sdLimitRep = (p, s, l, sdf) => {
    const q = p.map(
       (v, i) => v - s[i] * clamp(round(v / s[i]), -l[i], l[i])
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

const map = (p, iterations) => {
  const size = 1
  let d = MAX_DIST;
  let q = rotateAll([p[0], p[1], p[2] - 5]);
  let currIter = 0, cell
  for (let i = 0; i < iterations; i++) {
    currIter++
    cell = [...q.map(v => floor(v * currIter))]
    if (i % 2 === 0) {
      cell = [cell[1], cell[0], cell[2]]
    } else if (i % 3 === 0) {
      cell = [cell[0], cell[2], cell[1]]
    } else if (i % 4 === 1) {
      cell = [cell[1], cell[2], cell[0]]
    } else if (i % 5 === 0) {
      cell = [cell[2], cell[1], cell[0]]
    }
    q = [...q.map(v => (abs(v) * 2) - size)]
    let r = hash13(cell)
    if (r < 0.2) break
  }
  
  let gap = 0.0001 * pow(iterations, currIter)
  let box = sdBox(q, [size-gap, size-gap, size-gap])
  box /= pow(iterations, currIter)
  
  let r = hash13(cell)

  if (r < 0.01) {
    box = 0.004
  }
  return min(d, min(box, 1))

}


// Recursive Menger Sponge SDF
const mg = (p, iterations) => {
    // Apply rotation to the input point
    const rot = rotateAll(p)
    // let d = sdBox(p, [1, 1, 1])
    let d = sdLimitRep(p, [.1, .1, .1], [15, 15, 15], sdBox)
     
    let scale = 1
    for (let i = 0; i < iterations; i++) {
        scale *= 3
        const q = rot.map((r) => abs((r * scale) % 3) - 1)
        const hole = min(max(q[0], q[1]), min(max(q[1], q[2]), max(q[0], q[2])))
        d = max(d, -hole / scale)
    }
    
    d = max(d, sdBox(rot, [10, 10, 6]))

    return d
}

// Calculate surface normal
const getNormal = (p) => {
    const eps = 0.001
    /*
     return vec3.normalize([
        mg([p[0] + eps, p[1], p[2]], ITERATIONS) -
            mg([p[0] - eps, p[1], p[2]], ITERATIONS),
        mg([p[0], p[1] + eps, p[2]], ITERATIONS) -
            mg([p[0], p[1] - eps, p[2]], ITERATIONS),
        mg([p[0], p[1], p[2] + eps], ITERATIONS) -
            mg([p[0], p[1], p[2] - eps], ITERATIONS)
    ])
    */ 
    return vec3.normalize([
      map([p[0]+eps, p[1], p[2]], ITERATIONS) - map([p[0]-eps, p[1], p[2]], ITERATIONS),
      map([p[0], p[1]+eps, p[2]], ITERATIONS) - map([p[0], p[1]-eps, p[2]], ITERATIONS),
      map([p[0], p[1], p[2]+eps], ITERATIONS) - map([p[0], p[1], p[2]-eps], ITERATIONS)
    ])
}

// Raymarch function
const raymarch = (ro, rd) => {
    let dO = 0
    let hitPoint = null

    for (let i = 0; i < MAX_STEPS; i++) {
        const p = vec3.add(ro, vec3.mul(rd, dO))
        const dS = map(p, ITERATIONS)
    //mg(p, ITERATIONS)

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
    const gridSize = 60 // Increased for better coverage
    const camera = [0, 0, -10] // Moved camera back slightly
    const lineStepSize = 0.01
    const maxLineSteps = 150
    const width = SIZE[0] - MARGIN * 2
    const height = SIZE[1] - MARGIN * 2

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const startX = (i / gridSize) * 2 - 1
            const startY = (j / gridSize) * 2 - 1

            let path = []
            let currentPoint = [startX, startY, -1]

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
            rect(SIZE, { fill: '#111' }),
            group(
                { stroke: '#fefefe', weight: 1, fill: 'rgba(0,0,0,0)' },
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
