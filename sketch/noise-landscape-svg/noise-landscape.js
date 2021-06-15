import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import SimplexNoise from 'simplex-noise'
import remap from './remap'
import Ptransform from './Ptransform'
import funcs from '../../src/js/sketch-common/plane-curve'

const simplex = new SimplexNoise('seed')
const planeFunctionsNames = Object.entries(funcs).map((func_name) => {
    if ('archimedean_spiral' !== func_name[0]) {
        return func_name[0]
    }
})

const sketch = {
    margin: 20,
    res: 0.2,
    scale: 0.1,
    moves: 50,
    downscale: 2,
    nMov: 0,
    points: [],
    lines: [],
    nFreq: 50,
    nAmp: 1200,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
    planeFunctionsNames: 'astroid',
    perspTrans: new Ptransform(0.5, 0.5),
    launch: () => {
        sketch.svg.init()
        sketch.perspTrans.init(sketch.svg.width, sketch.svg.height)
        sketch.init()
    },
    init: () => {
        sketch.points = []
        sketch.lines = []
        sketch.nMov = 0
        sketch.planeFunction =
            planeFunctionsNames[
                Math.round(Math.random() * planeFunctionsNames.length)
            ]
        for (let x = -3; x < 3; x += sketch.res) {
            for (let y = -3; y < 3; y += sketch.res) {
                sketch.points.push({
                    x: (Math.random() - 0.5) * sketch.res + x,
                    y: (Math.random() - 0.5) * sketch.res + y,
                    angle: Math.random() * Math.PI,
                    height: 0
                })
                sketch.lines.push([])
            }
        }
        console.log('Sketch initialized')
        console.log(sketch.planeFunction)
        sketch.update()
    },
    update: () => {
        for (let i = 0; i < sketch.points.length; i++) {
            if (sketch.lines[i] === undefined) return

            const nx = sketch.points[i].x
            const ny = sketch.points[i].y
            const v = funcs[sketch.planeFunctionsNames]({ x: nx, y: ny })
            const a =
                Math.atan2(v.x / sketch.nFreq, v.y / sketch.nFreq) * sketch.nAmp
            const n1 =
                simplex.noise3D(nx / sketch.nFreq, ny / sketch.nFreq, 0) *
                sketch.nAmp *
                a
            const n2 =
                simplex.noise3D(0, nx / sketch.nFreq, ny / sketch.nFreq) *
                sketch.nAmp *
                a
            const n3 =
                simplex.noise3D(nx / sketch.nFreq, 0, ny / sketch.nFreq) *
                sketch.nAmp *
                a
            //console.log('n1 ', n1, ' n2 ', n2, ' n3 ', n3)
            const n =
                simplex.noise3D(
                    (Math.cos(n3) * Math.cos(n1)) / sketch.nFreq,
                    (Math.cos(n3) * Math.sin(n2)) / sketch.nFreq,
                    Math.sin(n3) / sketch.nFreq
                ) * sketch.nAmp

            sketch.points[i].x += Math.cos(sketch.points[i].angle) * 0.03
            sketch.points[i].y += Math.sin(sketch.points[i].angle) * 0.03
            sketch.points[i].height = n + 1
            sketch.points[i].angle += n * sketch.scale

            const _p = sketch.perspTrans.do['transform'](
                remap(
                    sketch.points[i].x,
                    -sketch.downscale,
                    sketch.downscale,
                    sketch.margin,
                    sketch.svg.width - sketch.margin
                ),
                remap(
                    sketch.points[i].y,
                    -sketch.downscale,
                    sketch.downscale,
                    sketch.margin,
                    sketch.svg.height - sketch.margin
                ),
                sketch.svg.height - sketch.points[i].height * sketch.svg.height
            )
            if (
                _p[0] > sketch.margin &&
                _p[0] < sketch.svg.width - sketch.margin &&
                _p[1] > sketch.margin &&
                _p[1] < sketch.svg.height - sketch.margin
            ) {
                sketch.lines[i].push(_p)
            }
        }
        sketch.nMov++

        sketch.draw()

        if (sketch.nMov < sketch.moves) {
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
            filename = `recursive-division.${Y}-${m}-${d}_${H}.${i}.svg`,
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
