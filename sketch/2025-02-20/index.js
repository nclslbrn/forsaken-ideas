import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import exportSVG from '../../sketch-common/exportSVG'

const MAX_STEPS = 100
const MAX_DIST = 100
const SURFACE_DIST = 0.00001
const ITERATIONS = 3
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const {cos, sin, PI, sqrt, max, min, abs} = Math
// Vector operations
const vec3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (v, s) => [v[0] * s, v[1] * s, v[2] * s],
    length: (v) => sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]),
    normalize: (v) => {
        const len = vec3.length(v)
        return [v[0] / len, v[1] / len, v[2] / len]
    }
}

// Rotation functions
function rotateX(p, angle) {
    const c = cos(angle)
    const s = sin(angle)
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
}

function rotateY(p, angle) {
    const c = cos(angle)
    const s = sin(angle)
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
}

function rotateZ(p, angle) {
    const c = cos(angle)
    const s = sin(angle)
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]
}

// Apply all rotations
function rotateAll(p) {
    let rotated = rotateX(p, 0)
    rotated = rotateY(rotated, PI/3)
    rotated = rotateZ(rotated, PI/3)
    return rotated
}

// Signed Distance Function for a box
function sdBox(p, b) {
    // Apply rotation before calculating SDF
    const rotated = rotateAll(p)
    const d = [
        abs(rotated[0]) - b[0],
        abs(rotated[1]) - b[1],
        abs(rotated[2]) - b[2]
    ]
    return (
        min(max(d[0], max(d[1], d[2])), 0) +
        vec3.length([max(d[0], 0), max(d[1], 0), max(d[2], 0)])
    )
}

// Recursive Menger Sponge SDF
function mengerSponge(p, iterations) {
    // Apply rotation to the input point
    const rotated = rotateAll(p)
    let d = sdBox(p, [1, 1, 1])
    let scale = 1

    for (let i = 0; i < iterations; i++) {
        scale *= 4
        const q = [
            abs((rotated[0] * scale) % 3) - 1,
            abs((rotated[1] * scale) % 3) - 1,
            abs((rotated[2] * scale) % 3) - 1
        ]

        const hole = min(
            max(q[0], q[1]),
            min(max(q[1], q[2]), max(q[0], q[2]))
        )
        d = max(d, -hole / scale)
    }

    return d
}

// Calculate surface normal
function getNormal(p) {
    const eps = 0.01
    return vec3.normalize([
        mengerSponge([p[0] + eps, p[1], p[2]], ITERATIONS) - mengerSponge([p[0] - eps, p[1], p[2]], ITERATIONS),
        mengerSponge([p[0], p[1] + eps, p[2]], ITERATIONS) - mengerSponge([p[0], p[1] - eps, p[2]], ITERATIONS),
        mengerSponge([p[0], p[1], p[2] + eps], ITERATIONS) - mengerSponge([p[0], p[1], p[2] - eps], ITERATIONS)
    ])
}

// Raymarch function
function raymarch(ro, rd) {
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
function generateContourLines(width, height) {
    const lines = []
    const gridSize = 400 // Increased for better coverage
    const camera = [0, 0, -5] // Moved camera back slightly
    const lineStepSize = 0.0001
    const maxLineSteps = 200

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const startX = ((i / gridSize) * 2 - 1) * 3
            const startY = ((j / gridSize) * 2 - 1) * 3

            let path = []
            let currentPoint = [startX, startY, -2.5]

            for (let step = 0; step < maxLineSteps; step++) {
                const rd = vec3.normalize([
                    currentPoint[0] - camera[0],
                    currentPoint[1] - camera[1],
                    currentPoint[2] - camera[2]
                ])

                const result = raymarch(camera, rd)

                if (result.point) {
                    const normal = getNormal(result.point)
                    const screenX = ((currentPoint[0] + 1) * width) / 2
                    const screenY = ((currentPoint[1] + 1) * height) / 2

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

function generateSVG(width, height) {
    const lines = generateContourLines(width, height)
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="background: white">
        <g stroke="black" stroke-width="1" fill="none">`

    lines.forEach((path) => {
        if (path.length > 1) {
            const pathData =
                `M ${path[0][0]} ${path[0][1]} ` +
                path
                    .slice(1)
                    .map((p) => `L ${p[0]} ${p[1]}`)
                    .join(' ')
            svg += `<path d="${pathData}" />` // Reduced stroke width
        }
    })

    svg += '</g></svg>'
    return svg
}

containerElement.removeChild(loader)
const svg = generateSVG(1920, 1920)
containerElement.innerHTML = svg

//window.init = sketch.init
window.plot = () => exportSVG(containerElement, 'sdf-to-plot')
window.infobox = infobox
handleAction()
