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

const circle = (theta) => {
    return { x: Math.cos(theta), y: Math.sin(theta) }
}

const container = document.getElementById('windowFrame')
const simplex = new SimplexNoise()
const tracer = new SvgTracer({
    parentElem: container,
    size: 'A3_landscape'
})

const sketch = {
    iterations: 30,
    numPoints: 4000,
    margin: 0.2,
    scale: 1,
    speed: 0.009,
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
        
        const rot = (Math.PI * 2) / sketch.numPoints
        for (let i = 0; i < sketch.numPoints; i++) {
            const theta = rot * i
            const pos = { x: Math.cos(theta), y: Math.sin(theta) }
            const disp = funcs[sketch.trigoFunc](pos)
            sketch.points[i] = {
                x: Math.cos(pos.x - disp.x),
                y: Math.sin(pos.y - disp.y)
            }
            sketch.lines[i] = []
        }
        tracer.clear()
        sketch.palette.colors.forEach((color)=> 
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
                let point = { ...sketch.points[p] }

                //  const v1 = circle(angle)
                const v1 = funcs[sketch.trigoFunc](point)
                const a1 = Math.atan2(v1.y, v1.x)
                const a2 = simplex.noise2D(v1.x / 50, v1.y / 50) * 200
                const v2 = circle(a1 + a2)
                const v3 = {
                    x: Math.cos(v1.x + v2.x),
                    y: Math.sin(v1.y + v2.y)
                }
                const v4 = v3 //funcs['sinusoidal'](v3)

                sketch.lines[p].push([
                    map(
                        point.x,
                        -sketch.scale,
                        sketch.scale,
                        tracer.width * sketch.margin,
                        tracer.width - tracer.width * sketch.margin
                    ),
                    map(
                        point.y,
                        -sketch.scale,
                        sketch.scale,
                        tracer.height * sketch.margin,
                        tracer.height - tracer.height * sketch.margin
                    )
                ])

                sketch.points[p].x += v4.x * sketch.speed
                sketch.points[p].y += v4.y * sketch.speed
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
                group: sketch.palette.colors[i % sketch.palette.colors.length].id,
                stroke: sketch.palette.colors[i % sketch.palette.colors.length].value
            })
        }
        tracer.text({
            x: tracer.width * sketch.margin,
            y: tracer.height - tracer.height * sketch.margin * 0.5,
            text: 'PLANE CURVE',
            fontSize: 14,
            group: sketch.palette.colors[0].id
        })

        tracer.text({
            x: tracer.width - tracer.width * sketch.margin * 1.5,
            y: tracer.height - tracer.height * sketch.margin * 0.5,
            text: sketch.trigoFunc.toUpperCase().replaceAll('_', ' '),
            fontSize: 14,
            group:  sketch.palette.colors[0].id
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        tracer.export({ name: 'mystic-sphere' })
    }
}

export default sketch
