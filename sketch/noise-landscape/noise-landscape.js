import perspective from 'perspective-transform'
import paramSlider from '../../src/js/sketch-common/param-slider'
let canvas = null
const params = {
    strenght: {
        value: 50.0,
        options: { min: 0.1, max: 100, step: 0.1, label: 'Strength' }
    },
    noiseScale: {
        value: 0.25,
        options: { min: 0.01, max: 0.5, step: 0.01, label: 'Noise scale' }
    },

    noiseSample: {
        value: 20,
        options: { min: 1, max: 40, step: 1, label: 'Noise sample' }
    },

    opacity: {
        value: 5,
        options: { min: 1, max: 9, step: 1, label: 'Opacity' }
    }
}

const sketch = (p5) => {
    let topoPoints, pTransform
    const numPoints = 3000
    const squeeze_y = 0.45
    const perspective_x = 0.75

    const ratio = window.innerWidth / window.innerHeight

    sketch.init = () => {
        topoPoints = []

        for (let i = 0; i < numPoints; i++) {
            topoPoints.push({
                pos: p5.createVector(
                    p5.width * 0.5 + p5.randomGaussian() * p5.width * 0.25,
                    p5.height * 0.5 + p5.randomGaussian() * p5.height * 0.25
                ),
                angle: Math.random() * Math.PI,
                height: 0
            })
        }

        p5.background(255, 240, 238)
    }

    sketch.exportPNG = () => {
        const date = new Date()
        const filename =
            'Noise-landscape.' +
            date.getFullYear() +
            '-' +
            date.getMonth() +
            '-' +
            date.getDay() +
            '_' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.save(canvas, filename, 'png')
    }

    p5.setup = () => {
        canvas = p5.createCanvas(window.innerWidth, window.innerHeight)
        const pad_x = (p5.width - p5.width * perspective_x) / 2
        const pad_y = (p5.height - p5.height * squeeze_y) / 2
        var srcCorners = [0, 0, p5.width, 0, p5.width, p5.height, 0, p5.height]
        var dstCorners = [
            pad_x,
            pad_y,
            p5.width - pad_x,
            pad_y,
            p5.width + pad_x,
            p5.height - pad_y,
            -pad_x,
            p5.height - pad_y
        ]
        pTransform = perspective(srcCorners, dstCorners)
        const paramBox = document.createElement('div')
        paramBox.id = 'interactiveParameter'
        for (const i in params) {
            const elems = paramSlider(params[i])
            elems.forEach((elem) => {
                paramBox.appendChild(elem)
            })
        }
        document.body.appendChild(paramBox)
        init()
    }

    p5.draw = () => {
        if (topoPoints) {
            for (let i = 0; i < topoPoints.length; i++) {
                const nx = p5.map(topoPoints[i].pos.x, 0, p5.width, -1, 1)
                const ny = p5.map(topoPoints[i].pos.y, 0, p5.height, -1, 1)

                const np = pTransform.transform(
                    topoPoints[i].pos.x,
                    topoPoints[i].pos.y +
                        p5.height -
                        topoPoints[i].height * p5.height
                )

                p5.stroke(0, parseInt(params['opacity'].value))
                p5.point(np[0], np[1])

                /**
                 * Compute vectors
                 */
                const n1 =
                    p5.noise(
                        nx * params['noiseSample'].value,
                        ny * params['noiseSample'].value
                    ) * params['noiseScale'].value
                const n2 =
                    p5.noise(
                        nx * params['noiseSample'].value * 5,
                        ny * params['noiseSample'].value * 5
                    ) *
                    (params['noiseScale'].value / 100)
                const n3 =
                    p5.noise(
                        nx * params['noiseSample'].value * 30,
                        ny * params['noiseSample'].value * 30
                    ) *
                    (params['noiseScale'].value / 500)

                const n = (n1 + n2 + n3) / 3

                topoPoints[i].height = n + 1
                topoPoints[i].pos.x +=
                    p5.cos(topoPoints[i].angle) *
                    params['strenght'].value *
                    0.01
                topoPoints[i].pos.y +=
                    p5.sin(topoPoints[i].angle) *
                    params['strenght'].value *
                    0.01

                topoPoints[i].angle += n * 0.1
            }
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
        init()
    }
}
export default sketch
