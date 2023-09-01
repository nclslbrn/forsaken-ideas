import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import strangeAttractors from '../../src/js/sketch-common/strange-attractors'
import Notification from '../../src/js/sketch-common/Notification'
import ProgressBar from '../../src/js/sketch-common/ProgressBar'

const container = document.getElementById('windowFrame')
// A3square width - 1.5mm
const tracer = new SvgTracer({
    parentElem: container,
    size: 'A3_Square',
    dpi: 150,
    background: 'black'
})
const pdj = strangeAttractors().attractors['de_jong']

let points, lines, margin, scale, move

const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min + 1)) + min
}

const cutLines = (lines, nbCuts, maxLineLength) => {
    const dropPoint = 3
    const newLines = []

    for (let h = 0; h < lines.length; h++) {
        if (lines[h].points && lines[h].points.length > maxLineLength / 4) {
            let previousPoint = 0
            for (let c = 1; c < nbCuts; c++) {
                const randPoint = getRandomInt(
                    previousPoint,
                    lines[h].points.length - dropPoint
                )
                newLines.push({
                    points: lines[h].points.slice(previousPoint, randPoint),
                    group: lines[h].group
                })
                previousPoint = randPoint + dropPoint
            }
            newLines.push({
                points: lines[h].points.slice(
                    previousPoint,
                    lines[h].points.length
                ),
                groups: lines[h].group
            })
        } else {
            if (lines[h].points.length > 1) {
                newLines.push({
                    points: [...lines[h].points],
                    group: lines[h].group
                })
            }
        }
    }

    return newLines
}

const groups = [Math.random() < 0.5 ? 'steelblue' : 'tomato', 'white']
const progressBar = new ProgressBar(container, 0)
const sketch = {
    iterations: 20,
    res: 0.009,
    maxBounce: 3,
    setup: () => {
        tracer.init()
        groups.forEach((color) => {
            tracer.group({
                name: color,
                stroke: color,
                fill: 'none',
                id: color
            })
        })
        sketch.init()
    },
    init: () => {
        progressBar.reset()
        strangeAttractors().init('de_jong')
        scale = 0.5 + Math.ceil(Math.random() * 12)
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
                lines.push({
                    points: [],
                    group: Math.random() < 0.5 ? groups[0] : groups[1]
                })
            }
        }
        tracer.clearGroups()
        tracer.elem.addEventListener('click', sketch.getActivePointNum)
        sketch.update()
    },
    draw: () => {
        tracer.clearGroups()

        if (move === sketch.iterations) {
            const cuttedLines = cutLines(lines, 3, sketch.iterations)
            const removeEmpty = cuttedLines.filter(
                (line) => line.points.length > 1
            )

            removeEmpty.forEach((line) =>
                tracer.path({
                    points: line.points,
                    close: false,
                    strokeWidth: 1,
                    fill: 'none',
                    group: line.group
                })
            )
        } else {
            for (const line of lines) {
                // lines.forEach((line) =>
                tracer.path({
                    points: line.points,
                    close: false,
                    strokeWidth: 1,
                    fill: 'none',
                    //stroke: 'black',
                    group: line.group
                })
            }
        }
    },
    update: () => {
        if (move < sketch.iterations) {
            for (let i = 0; i < points.length; i++) {
                if (!points[i].stuck) {
                    const p = {
                        x: points[i].x / tracer.width - 0.5,
                        y: points[i].y / tracer.height - 0.5
                    }
                    const n1 = pdj({ x: p.x * 5, y: p.y * 5 })
                    const n2 = pdj({ x: p.x * 10, y: p.y * 10 })
                    const n3 = pdj({ x: p.x * 50, y: p.y * 50 })

                    const angle = Math.atan2(
                        n1.y + n2.y + n3.y,
                        n1.x + n2.x + n3.x
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
                    const lastPoint = lines[i].points.slice(-1).pop()
                    if (
                        lastPoint === undefined ||
                        (Math.abs(lastPoint[0] - points[i].x) > 0.5 &&
                            Math.abs(lastPoint[1] - points[i].y) > 0.5)
                    ) {
                        lines[i].points.push([points[i].x, points[i].y])
                    }
                    points[i].x += points[i].vx * 0.99
                    points[i].y += points[i].vy * 0.99
                }
            }
            move++
            progressBar.update(Math.round((move / sketch.iterations) * 100))
            sketch.draw()
            window.requestAnimationFrame(sketch.update)
        } else {
            /*  lines.forEach((line, index) =>
                console.log(`line n°${index} = ${line.points.length} points`)
            ) */
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
