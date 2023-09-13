import perspective from 'perspective-transform'
import paramSlider from '../../sketch-common/param-slider'

const params = {
    strenght: {
        value: 0.5,
        options: { min: 0.01, max: 0.99, step: 0.01, label: 'Strength' },
        callback: sketch.init
    },
    noiseScale: {
        value: 50,
        options: { min: 10, max: 90, step: 1, label: 'Noise scale' },
        callback: sketch.init
    },

    opacity: {
        value: 10,
        options: { min: 1, max: 19, step: 1, label: 'Opacity' },
        callback: sketch.init
    }
}
let topoPoints, pTransform, canvas

const sketch = (p5) => {
    const numPoints = 3000
    const squeeze_y = 0.45
    const perspective_x = 0.75

    p5.setup = function () {
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
        console.log(srcCorners, dstCorners)

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
        //sketch.init()
    }

    p5.draw = function () {
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
                const n1 = p5.noise(nx, ny, 0) * params['noiseScale'].value
                const n2 = p5.noise(0, nx, ny) * params['noiseScale'].value
                const n3 = p5.noise(nx, 0, ny) * params['noiseScale'].value
                const n = p5.noise(
                    Math.cos(n3) * Math.cos(n1) * params['strenght'].value,
                    Math.cos(n3) * Math.sin(n2) * params['strenght'].value,
                    Math.sin(n3)
                )

                topoPoints[i].height = n + 1
                topoPoints[i].pos.x +=
                    Math.cos(topoPoints[i].angle) * (window.innerWidth / 16)
                topoPoints[i].pos.y +=
                    Math.sin(topoPoints[i].angle) * (window.innerHeight / 10)

                topoPoints[i].angle += n
            }
        }
    }
    
    sketch.init = function () {
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

    sketch.exportPNG = function () {
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
}
export default sketch
