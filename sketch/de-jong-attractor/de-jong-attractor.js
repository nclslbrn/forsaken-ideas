import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import strangeAttractors from '../../src/js/sketch-common/strange-attractors'
import Notification from '../../src/js/sketch-common/Notification'
import {
    getRandomPalette,
    getColorCombination
} from '../../src/js/sketch-common/stabilo68-colors'

const container = document.getElementById('windowFrame')
const tracer = new SvgTracer(container, 'p32x24')
const pdj = strangeAttractors().attractors['de_jong']
let points, lines, margin, scale, strokeColors

const sketch = {
    res: 0.05,
    maxBounce: 1,
    setup: () => {
        tracer.init()
        sketch.init()
    },
    init: () => {
        strangeAttractors().init('de_jong')
        strokeColors = getColorCombination(3)
        scale = (Math.random() - 0.5) * 48
        points = []
        lines = []
        margin = { x: tracer.width * 0.1, y: tracer.height * 0.1 }
        for (let x = -0.4; x <= 0.4; x += sketch.res) {
            for (let y = -0.4; y <= 0.4; y += sketch.res) {
                points.push({
                    x: tracer.width / 2 + x * tracer.width,
                    y: tracer.height / 2 + y * tracer.height,
                    vx: Math.random() < 0.5 ? -1 : 1,
                    vy: Math.random() < 0.5 ? -1 : 1,
                    bounce: 0,
                    stuck: false
                })
                lines.push([])
            }
        }
        tracer.clear()
        tracer.elem.addEventListener('click', sketch.abortPlotting)
        strokeColors.colors.forEach((color) =>
            tracer.group({ name: color.id, stroke: color.value, fill: 'none' })
        )
        sketch.update()
    },
    draw: () => {
        tracer.clearGroups()
        let lineIndex = 0
        for (const line of lines) {
            tracer.path({
                points: line,
                close: false,
                strokeWidth: 1,
                group: strokeColors.colors[
                    lineIndex % strokeColors.colors.length
                ].id
            })
            lineIndex++
        }
    },
    update: () => {
        if (points.length > 0) {
            for (let i = 0; i < points.length; i++) {
                if (!points[i].stuck) {
                    const p = {
                        x: points[i].x / tracer.width,
                        y: points[i].y / tracer.height
                    }
                    const d = pdj({ x: p.x * 25, y: p.y * 25 })
                    const angle = Math.atan2(d.x, d.y)

                    points[i].vx = Math.cos(angle)
                    points[i].vy = Math.sin(angle)

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

                    if (
                        (d.x == 0 && d.y == 0) ||
                        points[i].bounce >= sketch.maxBounce
                    ) {
                        points[i].stuck = true
                    }
                    lines[i].push([points[i].x, points[i].y])
                    points[i].x += points[i].vx * scale
                    points[i].y += points[i].vy * scale
                }
            }
            sketch.draw()
            const activePoints = points.filter((point) => !point.stuck)
            if (activePoints.length > 0)
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
        tracer.export({ name: `pdj-${strokeColors.name}` })
    }
}

export default sketch
