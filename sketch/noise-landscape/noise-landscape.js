import perspective from 'perspective-transform'
import paramSlider from '../../src/js/sketch-common/param-slider'
let canvas = null
const params = {
    strenght: {
        value: 35.0,
        options: { min: 20.0, max: 50, step: 0.5, label: 'Strength' }
    },
    noiseScale: {
        value: 1.0,
        options: { min: 0.1, max: 2.1, step: 0.5, label: 'Noise scale' }
    },
    noiseSample: {
        value: 5,
        options: { min: 0.1, max: 10.0, step: 0.1, label: 'Noise sample' }
    },
    opacity: {
        value: 25,
        options: { min: 1, max: 50, step: 1, label: 'Opacity' }
    }
}

const sketch = (p5) => {
    let topoPoints, pTransform
    const numPoints = 6000
    const squeeze_y = 0.45
    const perspective_x = 0.75

    const ratio = window.innerWidth / window.innerHeight

    sketch.init = () => {
        topoPoints = []

        for (let i = 0; i < numPoints; i++) {
            topoPoints.push({
                pos: p5.createVector(
                    p5.randomGaussian(p5.width / 2, p5.width / 3),
                    p5.randomGaussian(p5.height / 2, p5.height / 3)
                ),
                angle: p5.random(p5.TWO_PI),
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
        //p5.randomSeed(p5.floor(p5.random(9999999)))

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
                        nx / params['noiseSample'].value,
                        ny / params['noiseSample'].value
                    ) *
                    (params['noiseScale'].value / 300)
                const n3 =
                    p5.noise(
                        nx + params['noiseSample'].value,
                        ny + params['noiseSample'].value
                    ) *
                    (params['noiseScale'].value / 50)

                const n = (n1 + n2 + n3) / 3

                topoPoints[i].height = n + 1
                topoPoints[i].pos.x +=
                    p5.cos(topoPoints[i].angle) * params['strenght'].value
                topoPoints[i].pos.y +=
                    p5.sin(topoPoints[i].angle) * params['strenght'].value
                topoPoints[i].angle += n
            }
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
        init()
    }
}
export default sketch
