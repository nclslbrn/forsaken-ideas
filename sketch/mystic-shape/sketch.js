import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Notification from '../../src/js/sketch-common/Notification'
import ease from '../../src/js/sketch-common/ease'
import funcs from '../../src/js/sketch-common/plane-curve'
import map from '../../src/js/sketch-common/remap'
import SimplexNoise from 'simplex-noise'

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
const tracer = new SvgTracer(container, 'a3', 'black')
const simplex = new SimplexNoise()

const sketch = {
    iterations: 30,
    numPoints: 5000,
    margin: 0.2,
    scale: 1,
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

        console.log(sketch.trigoFunc)

        const rot = (Math.PI * 2) / sketch.numPoints

        for (let i = 0; i < sketch.numPoints; i++) {
            const theta = rot * i
            const pos = { x: Math.cos(theta), y: Math.sin(theta) }
            const disp = funcs[sketch.trigoFunc](pos)
            sketch.points[i] = {
                x: Math.cos(theta * disp.x),
                y: Math.sin(theta * disp.y)
            }
            sketch.lines[i] = []
        }

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
                const a2 = simplex.noise2D(v1.x, v1.y) - 0.5
                const v2 = circle(a2)
                const v3 = {
                    x: Math.cos(v1.x + v2.x),
                    y: Math.sin(v1.y + v2.y)
                }
                const v4 = funcs['sinusoidal'](v3)

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

                sketch.points[p].x += v4.x * 0.007
                sketch.points[p].y += v4.y * 0.007
            }

            sketch.nIter++
            requestAnimationFrame(sketch.update)
            sketch.draw()
        } else {
            console.log('Sketch done')
            new Notification('Sketch done!', container, 'light')
        }
    },
    // push them into <svg>
    draw: () => {
        tracer.clear()
        for (const line of sketch.lines) {
            tracer.path({
                points: line,
                fill: 'none',
                stroke: 'white'
            })
        }
        tracer.text({
            x: tracer.width * sketch.margin,
            y: tracer.height - tracer.height * sketch.margin * 0.5,
            text: sketch.trigoFunc.toUpperCase().replaceAll('_', ' '),
            fontSize: 14,
            fill: 'white'
        })
    },
    // export inline <svg> as SVG file
    export: () => {
        tracer.export({ name: 'mystic-sphere' })
    }
}

export default sketch
