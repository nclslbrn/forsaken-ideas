import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import funcs from '../../src/js/sketch-common/plane-curve'
import Point from './Point'
import Notification from './../../src/js/sketch-common/Notification'
import { createNoise2D } from 'simplex-noise'
import {
    random,
    ceil,
    abs,
    sqrt,
    cos,
    sin,
    atan2,
    round
} from '../../src/js/sketch-common/Math'

let margin, pointSpacing, circleNum, radiuses, planeCurve, points, lines, frame
const simplex = createNoise2D()
const container = document.getElementById('windowFrame')
const randomPlaneCurveFunc = () => {
    const funcsName = []
    Object.entries(funcs).forEach((func) => {
        funcsName.push(func[0])
    })
    return funcsName[Math.floor(Math.random() * funcsName.length)]
}
const noise = (x, y) => {
    const freq = 0.1
    const turbulence = 1
    return turbulence * simplex(x * freq, y * freq)
}
const svg = new SvgTracer({
    parentElem: container,
    size: { w: window.innerWidth / 50, h: window.innerHeight / 50 },
    dpi: 150
})
const groups = [
    { name: 'lines', stroke: 'black' }, // , strokeWidth: 2
    { name: 'frame', stroke: 'tomato' }
]
const debug = false
const sketch = {
    // setup
    launch: () => {
        svg.init()
        margin = svg.cmToPixels(0.5)
        frame = {
            min: { x: margin, y: margin },
            max: { x: svg.width - margin, y: svg.height - margin }
        }
        pointSpacing = svg.cmToPixels(0.3)
        groups.forEach((g) => svg.group(g))
        sketch.init()
    },
    drawFrame: () => {
        // plotter drawing zone on separate layer to calibrate plotter
        svg.rect({
            x: margin,
            y: margin,
            w: frame.max.x - margin,
            h: frame.max.y - margin,
            group: groups[1].name,
            fill: 'none',
            stroke: 'tomato'
        })
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clearGroups()

        circleNum = 1 + 4 * ceil(random() * 5)
        radiuses = []
        for (let i = 0; i < circleNum - 1; i++) {
            radiuses.push(
                (1 / circleNum) * (i + 1) * (svg.width - margin * 2) * 0.7
            )
        }
        svg.elem.style.maxWidth = 'unset'
        svg.elem.style.maxHeight = 'unset'
        if (debug) {
            sketch.drawFrame()
            sketch.drawRadiuses()
        }
        points = []
        lines = []
        for (let x = frame.min.x; x <= frame.max.x; x += pointSpacing) {
            for (let y = frame.min.y; y <= frame.max.y; y += pointSpacing) {
                points.push(
                    new Point(
                        x,
                        y,
                        atan2(svg.height / 2 - y, svg.width / 2 - x)
                    )
                )
                lines.push([])
            }
        }
        planeCurve = randomPlaneCurveFunc()

        let n = 0
        while (n < 50) {
            for (let i = 0; i < points.length; i++) {
                if (!points[i].isStuck) {
                    const pos = [...points[i].pos]
                    if (sketch.getRadiusNum(pos) % 2 == 0) {
                        const p = {
                            x: (pos[0] / svg.width - 0.5) * 3.0,
                            y: (pos[1] / svg.height - 0.5) * 3.0
                        }
                        const curvePos = funcs[planeCurve](p, 1)
                        const loopPos = funcs['sinusoidal'](curvePos)
                        points[i].angle =
                            atan2(loopPos.y, loopPos.x) +
                            noise(curvePos.x, curvePos.y) * 0.1
                    } else {
                        points[i].angle = noise(
                            round(pos[0] / 64) * 16,
                            round(pos[1] / 64) * 16
                        )
                        // * atan2( svg.height / 2 - pos[1], svg.width / 2 - pos[0])
                    }
                    points[i].pos = [
                        pos[0] + cos(points[i].angle) * points[i].speed,
                        pos[1] + sin(points[i].angle) * points[i].speed
                    ]
                    if (
                        points[i].pos[0] > frame.min.x &&
                        points[i].pos[0] < frame.max.x &&
                        points[i].pos[1] > frame.min.y &&
                        points[i].pos[1] < frame.max.y
                    ) {
                        lines[i].push([...points[i].pos])
                    } else {
                        points[i].isStuck = true
                    }
                }
            }
            n++
        }

        lines.forEach((l) => {
            if (l.length > 1) {
                svg.path({
                    points: l,
                    fill: 'none',
                    stroke: 'black',
                    group: groups[0].name
                })
            }
        })
        new Notification(
            `Sketch drawn with ${planeCurve.replaceAll('_', ' ')}.`,
            container,
            'light'
        )
    },
    getRadiusNum: (pt) => {
        // distance from center
        const v = [abs(svg.width / 2 - pt[0]), abs(svg.height / 2 - pt[1])]
        const dist = sqrt(v[0] ** 2 + v[1] ** 2)
        let rNum = 1
        radiuses.forEach((r, i) => {
            if (r < dist) rNum = i
        })
        return rNum
    },
    drawRadiuses: () => {
        radiuses.forEach((r) =>
            svg.circle({
                x: svg.width / 2,
                y: svg.height / 2,
                r: r,
                fill: 'none',
                stroke: 'tomato',
                group: groups[1].name
            })
        )
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'sketchname' })
    }
}

export default sketch
