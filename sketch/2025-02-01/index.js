import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, group, asSvg, svgDoc, circle } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
//  import { normalize, add, sub, mul, dot } from '@thi.ng/vectors'
import { invert33 } from '@thi.ng/matrices'

const SIZE = [1200, 1200],
    MARGIN = 50,
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { abs, tan, min, max, cos, sin, random, PI, sign } = Math

let width, height, drawElems
let time = 0 // Add time for animation

ROOT.appendChild(CANVAS)

const dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2],
      add = (v1, v2) => [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]],
      sub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]],
      mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s],
      normalize = (v) => {
        const len = Math.sqrt(dot(v, v))
        return [v[0] / len, v[1] / len, v[2] / len]
    }

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

    function matrixFromEuler(x, y, z) {
        // Create individual rotation matrices
        const rx = [1, 0, 0, 0, cos(x), -sin(x), 0, sin(x), cos(x)]

        const ry = [cos(y), 0, sin(y), 0, 1, 0, -sin(y), 0, cos(y)]

        const rz = [cos(z), -sin(z), 0, sin(z), cos(z), 0, 0, 0, 1]

        // Combine rotations: Z * Y * X
        const temp = new Array(9)
        const result = new Array(9)

        // Multiply rz * ry
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                temp[i * 3 + j] =
                    rz[i * 3] * ry[j] +
                    rz[i * 3 + 1] * ry[3 + j] +
                    rz[i * 3 + 2] * ry[6 + j]
            }
        }

        // Multiply (rz * ry) * rx
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                result[i * 3 + j] =
                    temp[i * 3] * rx[j] +
                    temp[i * 3 + 1] * rx[3 + j] +
                    temp[i * 3 + 2] * rx[6 + j]
            }
        }

        return result
    }

    function transformPoint(matrix, point) {
        return [
            point[0] * matrix[0] + point[1] * matrix[1] + point[2] * matrix[2],
            point[0] * matrix[3] + point[1] * matrix[4] + point[2] * matrix[5],
            point[0] * matrix[6] + point[1] * matrix[7] + point[2] * matrix[8]
        ]
    }

    function intersectCube(origin, direction, cube) {
        // Create rotation matrix and its inverse
        const rotMatrix = matrixFromEuler(...cube.rot)
        const invRotMatrix = invert33([], rotMatrix)

        // Transform ray to object space
        const rayOrigin = sub(origin, cube.center)
        const localOrigin = transformPoint(invRotMatrix, rayOrigin)
        const localDir = normalize(transformPoint(invRotMatrix, direction))

        const halfSize = cube.size / 2

        // Check intersection with axis-aligned box
        const tx1 = (-halfSize - localOrigin[0]) / localDir[0]
        const tx2 = (halfSize - localOrigin[0]) / localDir[0]
        const ty1 = (-halfSize - localOrigin[1]) / localDir[1]
        const ty2 = (halfSize - localOrigin[1]) / localDir[1]
        const tz1 = (-halfSize - localOrigin[2]) / localDir[2]
        const tz2 = (halfSize - localOrigin[2]) / localDir[2]

        const tmin = max(min(tx1, tx2), min(ty1, ty2), min(tz1, tz2))
        const tmax = min(max(tx1, tx2), max(ty1, ty2), max(tz1, tz2))

        if (tmax < 0 || tmin > tmax) {
            return null
        }

        const t = tmin < 0 ? tmax : tmin
        if (t < 0) {
            return null
        }

        // Calculate hit point and normal in object space
        const localHit = add(localOrigin, mul(localDir, t))

        // Determine which face was hit
        let localNormal = [0, 0, 0]
        const epsilon = 1e-4

        if (abs(abs(localHit[0]) - halfSize) < epsilon) {
            localNormal[0] = sign(localHit[0])
        } else if (abs(abs(localHit[1]) - halfSize) < epsilon) {
            localNormal[1] = sign(localHit[1])
        } else if (abs(abs(localHit[2]) - halfSize) < epsilon) {
            localNormal[2] = sign(localHit[2])
        }

        // Transform hit point and normal back to world space
        const worldHit = add(cube.center, transformPoint(rotMatrix, localHit))
        const worldNormal = normalize(transformPoint(rotMatrix, localNormal))

        return { t, hitPoint: worldHit, normal: worldNormal }
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
