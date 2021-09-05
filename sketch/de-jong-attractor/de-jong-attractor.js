import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import strangeAttractors from '../../src/js/sketch-common/strange-attractors'
import Notification from '../../src/js/sketch-common/Notification'

const container = document.getElementById('windowFrame')
const tracer = new SvgTracer(container, 'p32x24')
const pdj = strangeAttractors().attractors['de_jong']

let points, lines, margin, scale, strokeColors, move

const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min + 1)) + min
}

const cutLines = (lines, nbCuts, maxLineLength) => {
    const cuttedLines = []
    const dropPoint = 3
    for (let h = 0; h < lines.length; h++) {
        if (lines[h].length > maxLineLength / 4) {
            let previousPoint = 0
            for (let c = 1; c < nbCuts; c++) {
                const randPoint = getRandomInt(
                    previousPoint,
                    lines[h].length - dropPoint
                )
                cuttedLines.push(lines[h].slice(previousPoint, randPoint))
                previousPoint = randPoint + dropPoint
            }
            cuttedLines.push(lines[h].slice(previousPoint, lines[h].length))
        } else {
            if (lines[h].length > 1) {
                cuttedLines.push([...lines[h]])
            }
        }
    }

    return cuttedLines
}

const sketch = {
    iterations: 50,
    res: 0.009,
    maxBounce: 1,
    setup: () => {
        tracer.init()
        sketch.init()
    },
    init: () => {
        strangeAttractors().init('de_jong')
        scale = 2 * Math.ceil(Math.random() * 4)
        points = []
        lines = []
        move = 0
        margin = { x: tracer.width * 0.1, y: tracer.height * 0.1 }
        const center = { x: tracer.width / 2, y: tracer.height / 2 }
        for (let x = -0.4; x <= 0.4; x += sketch.res) {
            for (let y = -0.4; y <= 0.4; y += sketch.res) {
                const randPos = {
                    x: x + (Math.random() * 0.1 - 0.05),
                    y: y + (Math.random() * 0.1 - 0.05)
                }
                points.push({
                    x: center.x + randPos.x * tracer.width,
                    y: center.y + randPos.y * tracer.height,
                    vx: Math.random() < 0.5 ? -1 : 1,
                    vy: Math.random() < 0.5 ? -1 : 1,
                    bounce: 0,
                    stuck: false
                })
                lines.push([])
            }
        }
        tracer.clear()
        tracer.elem.addEventListener('click', sketch.getActivePointNum)
        sketch.update()
    },
    draw: () => {
        tracer.clear()
        if (move === sketch.iterations) {
            const cuttedLines = cutLines(lines, 3, sketch.iterations)
            const removeEmpty = cuttedLines.filter((line) => line.length > 1)
            removeEmpty.forEach((line) =>
                tracer.path({
                    points: line,
                    close: false,
                    strokeWidth: 1,
                    fill: 'none',
                    stroke: 'black'
                })
            )
        } else {
            lines.forEach((line) =>
                tracer.path({
                    points: line,
                    close: false,
                    strokeWidth: 1,
                    fill: 'none',
                    stroke: 'black'
                })
            )
        }
    },
    update: () => {
        if (move < sketch.iterations) {
            for (let i = 0; i < points.length; i++) {
                if (!points[i].stuck) {
                    const p = {
                        x: points[i].x / tracer.width,
                        y: points[i].y / tracer.height
                    }
                    const n1 = pdj({ x: p.x * 5, y: p.y * 5 })
                    const n2 = pdj({ x: p.x * 10, y: p.y * 10 })
                    const n3 = pdj({ x: p.x * 50, y: p.y * 50 })

                    const angle = Math.atan2(
                        n1.y * n2.y * n3.y,
                        n1.x * n2.x * n3.x
                    )

                    points[i].vx = Math.cos(angle) * scale
                    points[i].vy = Math.sin(angle) * scale

                    if (
                        points[i].x > tracer.width - margin.x ||
                        points[i].x < margin.x
                    ) {
                        points[i].vx *= -1
                        points[i].bounce++
                    }
                    if (
                        points[i].y > tracer.height - margin.y ||
                        points[i].y < margin.y
                    ) {
                        points[i].vy *= -1
                        points[i].bounce++
                    }

                    if (points[i].bounce >= sketch.maxBounce) {
                        points[i].stuck = true
                    }
                    lines[i].push([points[i].x, points[i].y])
                    points[i].x += points[i].vx * 0.95
                    points[i].y += points[i].vy * 0.95
                }
            }
            move++
            // console.log(move, '/', sketch.iterations)
            sketch.draw()
            window.requestAnimationFrame(sketch.update)
        } else {
            console.log('sketch done')
            new Notification('Sketch done !', container, 'light')
        }
    },
    abortPlotting: () => {
        sketch.getActivePointNum()
        points.forEach((point) => (point.stuck = true))
        sketch.getActivePointNum()
    },
    getActivePointNum: () => {
        const activePoints = points.filter((point) => !point.stuck)
        console.log('active points', activePoints.length)
    },
    export: () => {
        tracer.export({ name: `pdj-@${scale}x-` })
    }
}

export default sketch
