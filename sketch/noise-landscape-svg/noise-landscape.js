import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import SimplexNoise from 'simplex-noise'
import remap from './remap'
import Ptransform from '../../src/js/sketch-common/Ptransform'

const simplex = new SimplexNoise(Math.random() * 99999)

const sketch = {
    margin: 20,
    res: 0.2,
    scale: 1,
    moves: 300,
    nMov: 0,
    points: [],
    lines: [],
    nFreq: 0.01,
    nAmp: 4.5,
    stepSize: 0.015,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
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
        for (let x = -3; x < 3; x += sketch.res) {
            for (let y = -3; y < 3; y += sketch.res) {
                sketch.points.push({
                    x: (Math.random() - 0.5) * sketch.res + x,
                    y: (Math.random() - 0.5) * sketch.res + y,
                    z: (Math.random() - 0.5) * sketch.res,
                    angle: 0
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
        console.log(sketch.planeFunction)
        sketch.update()
    },
    update: () => {
        for (let i = 0; i < sketch.points.length; i++) {
            if (sketch.lines[i] === undefined) return

            const nx = sketch.points[i].x
            const ny = sketch.points[i].y
            const nz = sketch.points[i].z

            const n =
                simplex.noise3D(
                    nx * sketch.nFreq,
                    ny * sketch.nFreq,
                    nz * sketch.nFreq
                ) * sketch.nAmp

            sketch.points[i].x +=
                Math.cos(sketch.points[i].angle) * sketch.stepSize
            sketch.points[i].y +=
                Math.sin(sketch.points[i].angle) * sketch.stepSize
            sketch.points[i].z = n * 300
            sketch.points[i].angle = n

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
