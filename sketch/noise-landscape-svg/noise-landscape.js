import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import remap from '../../src/js/sketch-common/remap'
import Ptransform from '../../src/js/sketch-common/Ptransform'
import Fbm from './Fbm'
import SimplexNoise from 'simplex-noise'

const simplex = new SimplexNoise()
const sketch = {
    margin: 30, // sketch margin
    res: 0.2, // space between points (within the grid)
    scale: 1, // scale the plane of the grid
    points: [], // store points positions at t
    lines: [], // store every points pos
    stepSize: 0.01, // distance between each move
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a3portrait'),
    perspTrans: new Ptransform(0.5, 0.5),
    fbm: new Fbm({
        frequency: 0.15,
        octaves: 9,
        amplitude: 0.15,
        seed: Math.random()
    }),
    launch: () => {
        sketch.svg.init()
        sketch.perspTrans.init(sketch.svg.width, sketch.svg.height)
        sketch.init()
    },
    init: () => {
        sketch.points = []
        sketch.lines = []
        sketch.nMov = 0
        for (let x = -3; x < 3; x += sketch.res) {
            for (let y = -3; y < 3; y += sketch.res) {
                sketch.points.push({
                    x: (Math.random() / 2 - 0.25) * sketch.res + x,
                    y: (Math.random() / 2 - 0.25) * sketch.res + y,
                    z: simplex.noise2D(x / 3, y / 3),
                    angle: Math.random() * Math.PI * 2,
                    isLiving: true
                })
                sketch.lines.push([])
            }
        }
        sketch.points.push({
            x: 0,
            y: 0,
            angle: Math.random() * Math.PI,
            height: 1
        })
        sketch.lines.push([])
        console.log('Sketch initialized')
        console.log('Noise seed', sketch.fbm.seed)
        sketch.update()
    },
    update: () => {
        for (let i = 0; i < sketch.points.length; i++) {
            if (sketch.lines[i] === undefined) return
            if (sketch.points[i].isLiving) {
                const n = sketch.fbm.f(
                    sketch.points[i].x,
                    sketch.points[i].y,
                    sketch.points[i].z
                )

                const theta = sketch.points[i].angle
                sketch.points[i].x += Math.cos(theta) * sketch.stepSize
                sketch.points[i].y += Math.sin(theta) * sketch.stepSize
                sketch.points[i].z = n - 1 * 10
                sketch.points[i].angle = 1 / n

                const _p = sketch.perspTrans.do['transform'](
                    remap(
                        sketch.points[i].x,
                        -sketch.scale,
                        sketch.scale,
                        sketch.margin,
                        sketch.svg.width - sketch.margin
                    ),
                    remap(
                        sketch.points[i].y,
                        -sketch.scale,
                        sketch.scale,
                        sketch.margin,
                        sketch.svg.height - sketch.margin
                    ) - sketch.points[i].z
                )
                if (
                    _p[0] > sketch.margin &&
                    _p[0] < sketch.svg.width - sketch.margin &&
                    _p[1] > sketch.margin &&
                    _p[1] < sketch.svg.height - sketch.margin
                ) {
                    sketch.lines[i].push(_p)
                } else {
                    sketch.points[i].isLiving = false
                }
            }
        }
        sketch.nMov++
        sketch.draw()
        const livingPointCount = sketch.points.reduce((prev, curr) => {
            return prev + (curr.isLiving ? 1 : 0)
        }, 0)
        if (livingPointCount > 0) {
            console.log(livingPointCount + ' living points')
            requestAnimationFrame(sketch.update)
        } else {
            console.log('Sketch done')
        }
    },
    draw: () => {
        sketch.svg.clear()
        for (let i = 0; i < sketch.lines.length; i++) {
            if (sketch.lines[i].length > 1) {
                sketch.svg.path({
                    points: sketch.lines[i],
                    stroke: 'black',
                    fill: 'none',
                    close: false
                })
            }
        }
    },
    export: () => {
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes(),
            filename = `noise-landscape.${Y}-${m}-${d}_${H}.${i}.svg`,
            content = new Blob([sketch.svg.parentElem.innerHTML], {
                type: 'text/plain'
            })

        let svgFile = null
        if (svgFile !== null) {
            window.URL.revokeObjectURL(svgFile)
        }
        svgFile = window.URL.createObjectURL(content)

        const link = document.createElement('a')
        link.href = svgFile
        link.download = filename
        link.click()
    }
}

export { sketch }
