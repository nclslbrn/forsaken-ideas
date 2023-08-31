import '../../src/sass/frame-canvas.scss'
import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Notification from '../../src/js/sketch-common/Notification'
import funcs from '../../src/js/sketch-common/plane-curve'
import map from '../../src/js/sketch-common/remap'
import { createNoise2D } from 'simplex-noise'
import { getColorCombination } from '../../src/js/sketch-common/stabilo68-colors'

const randomTrigoFunc = () => {
    const funcsName = []
    Object.entries(funcs).forEach((func) => {
        funcsName.push(func[0])
    })
    return funcsName[Math.floor(Math.random() * funcsName.length)]
}

const initPoints = {
    circle: () => {
        const pos = []
        const TAU = Math.PI * 2
        const numPoints = (sketch.scale / (sketch.res * 0.5)) ** 2
        for (let point = 0; point < numPoints; point++) {
            pos.push({
                x: Math.cos(Math.random() * TAU) * sketch.scale * Math.random(),
                y: Math.sin(Math.random() * TAU) * sketch.scale * Math.random(),
                stuck: false
            })
        }
        return pos
    },
    grid: () => {
        const pos = []
        for (let x = -sketch.scale; x <= sketch.scale; x += sketch.res) {
            for (let y = -sketch.scale; y <= sketch.scale; y += sketch.res) {
                pos.push({
                    x: x + Math.random() * sketch.res,
                    y: y + Math.random() * sketch.res,
                    stuck: false
                })
            }
        }
        return pos
    }
}

const container = document.getElementById('windowFrame')
const simplex = createNoise2D()
const tracer = new SvgTracer({
    parentElem: container,
    size: 'A3_Square'
})

const sketch = {
    iterations: 50,
    margin: tracer.cmToPixels(3.5),
    scale: 5,
    speed: 0.05,
    res: 0.15,
    // setup
    launch: () => {
        tracer.init()
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        sketch.nIter = 0
        sketch.points = []
        sketch.lines = []
        sketch.trigoFunc = randomTrigoFunc()
        sketch.palette = getColorCombination(2)
        sketch.initMode = Math.random() > 0.5 ? 'circle' : 'grid'
        sketch.points = initPoints[sketch.initMode]()
        sketch.points.forEach((point) => sketch.lines.push([]))

        tracer.clear()
        sketch.palette.colors.forEach((color) =>
            tracer.group({
                name: color.id,
                id: color.id,
                stroke: color.value
            })
        )
        tracer.group({
            name: 'black',
            id: 'black',
            stroke: 'black'
        })
        sketch.update()
    },
    // compute change
    update: () => {
        if (sketch.nIter < sketch.iterations) {
            for (let p = 0; p < sketch.points.length; p++) {
                if (!sketch.points[p].stuck) {
                    const x = map(
                        sketch.points[p].x,
                        -sketch.scale,
                        sketch.scale,
                        sketch.margin,
                        tracer.width - sketch.margin
                    )
                    const y = map(
                        sketch.points[p].y,
                        -sketch.scale,
                        sketch.scale,
                        sketch.margin,
                        tracer.height - sketch.margin
                    )
                    if (
                        x < sketch.margin ||
                        x > tracer.width - sketch.margin ||
                        y < sketch.margin ||
                        y > tracer.height - sketch.margin
                    ) {
                        sketch.points[p].stuck = true
                    }
                    const a1 = map(
                        simplex(
                            Math.cos(sketch.points[p].x),
                            Math.sin(sketch.points[p].y)
                        ),
                        0,
                        1,
                        -1,
                        1
                    )
                    const v1 = funcs[sketch.trigoFunc]({
                        x: sketch.points[p].x * Math.cos(a1),
                        y: sketch.points[p].y * Math.sin(a1)
                    })

                    const v = funcs['sinusoidal'](v1)

                    const prev = sketch.lines[p][sketch.lines[p].length - 1]

                    if (
                        sketch.nIter === 0 ||
                        (Math.abs(prev[0] - x) > 1 && Math.abs(prev[1] - y) > 1)
                    ) {
                        sketch.lines[p].push([x, y])
                    }

                    sketch.points[p].x += sketch.speed * v.x
                    sketch.points[p].y += sketch.speed * v.y
                }
            }

            sketch.nIter++
            requestAnimationFrame(sketch.update)
            sketch.draw()
        } else {
            sketch.draw()
            const penSpecs = sketch.palette.colors.reduce((specs, color) => {
                return specs + `<br> - 88/${color.id} ${color.name}`
            }, '(Stabilo Art markers)')
            new Notification(
                `${sketch.palette.name} palette ${penSpecs}`,
                container,
                'light'
            )
        }
    },
    // push them into <svg>
    draw: () => {
        tracer.clearGroups()
        for (let i = 0; i < sketch.lines.length; i++) {
            tracer.path({
                points: sketch.lines[i],
                fill: 'none',
                group: sketch.palette.colors[i % sketch.palette.colors.length]
                    .id,
                stroke: sketch.palette.colors[i % sketch.palette.colors.length]
                    .value
            })
        }
        tracer.text({
            x: sketch.margin,
            y: tracer.height - sketch.margin + tracer.cmToPixels(1),
            text: 'PLANE CURVE',
            fontSize: 14,
            anchor: 'start',
            group: 'black'
        })

        tracer.text({
            x: tracer.width - sketch.margin,
            y: tracer.height - sketch.margin + tracer.cmToPixels(1),
            text: sketch.trigoFunc.toUpperCase().replaceAll('_', ' '),
            fontSize: 14,
            anchor: 'end',
            group: 'black'
        })
    },
    /**
     * Export/download inline <svg> as SVG file
     */
    export: () => {
        tracer.export({
            name: `mystic-shape-${sketch.trigoFunc}-${sketch.initMode}`
        })
    }
}

export default sketch
