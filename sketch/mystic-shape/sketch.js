import '../../src/sass/frame-canvas.scss'
import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Notification from '../../src/js/sketch-common/Notification'
import funcs from '../../src/js/sketch-common/plane-curve'
import map from '../../src/js/sketch-common/remap'
import SimplexNoise from 'simplex-noise'
import { getColorCombination } from '../../src/js/sketch-common/stabilo68-colors'

const randomTrigoFunc = () => {
    const funcsName = []
    Object.entries(funcs).forEach((func) => {
        funcsName.push(func[0])
    })
    return funcsName[Math.floor(Math.random() * funcsName.length)]
}

const container = document.getElementById('windowFrame')
const simplex = new SimplexNoise()
const tracer = new SvgTracer({
    parentElem: container,
    size: 'A3_landscape'
})

const sketch = {
    iterations: 50,
    margin: tracer.cmToPixels(6),
    scale: 3,
    speed: 0.03,
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

        for (let x = -3; x <= 3; x += sketch.res) {
            for (let y = -3; y <= 3; y += sketch.res) {
                const pos = {
                    x: x + Math.random() * sketch.res,
                    y: y + Math.random() * sketch.res
                }
                sketch.points.push({
                    x: pos.x,
                    y: pos.y,
                    stuck: false
                })
                sketch.lines.push([])
            }
        }

        tracer.clear()
        sketch.palette.colors.forEach((color) =>
            tracer.group({
                name: color.id,
                id: color.id,
                stroke: color.value
            })
        )
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
                        300 *
                            simplex.noise2D(
                                Math.cos(sketch.points[p].x),
                                Math.sin(sketch.points[p].y)
                            ),
                        0,
                        1,
                        -0.5,
                        0.5
                    )
                    const v1 = funcs[sketch.trigoFunc]({
                        x: sketch.points[p].x + Math.cos(a1),
                        y: sketch.points[p].y + Math.sin(a1)
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
            console.log('Sketch done')
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
            group: sketch.palette.colors[0].id
        })

        tracer.text({
            x: tracer.width - sketch.margin,
            y: tracer.height - sketch.margin + tracer.cmToPixels(1),
            text: sketch.trigoFunc.toUpperCase().replaceAll('_', ' '),
            fontSize: 14,
            anchor: 'end',
            group: sketch.palette.colors[0].id
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        tracer.export({ name: 'mystic-sphere' })
    }
}

export default sketch
