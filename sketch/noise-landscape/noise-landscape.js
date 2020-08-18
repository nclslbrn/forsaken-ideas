import perspective from 'perspective-transform'
let canvas = null

const sketch = (p5) => {
    const scale = 5
    const numPoints = 6000
    let topoPoints, pTransform
    let noiseScale = 0.5
    let noiseSample = 2
    let opacity = 12.5
    const squeeze_y = 0.45
    const perspective_x = 0.75
    const params = [
        {
            value: 0.5,
            options: { min: 0.1, max: 1, step: 0.01, label: 'Noise scale' }
        },
        {
            value: 2,
            options: { min: 0.1, max: 4.0, step: 0.1, label: 'Noise sample' }
        },
        {
            value: 12.5,
            options: { min: 1, max: 25, step: 1, label: 'Opacity' }
        }
    ]

    const htmlParam = (param) => {
        const label = document.createElement('label')
        label.innerHTML = param.options.label
        const slider = document.createElement('input')
        slider.type = 'range'
        slider.min = param.options.min
        slider.max = param.options.max
        slider.step = param.options.step
        slider.value = param.value
        const value = document.createElement('input')
        value.type = 'text'
        value.value = param.value

        slider.addEventListener('change', (event) => {
            param.value = event.target.value
            value.value = event.target.value

            console.log(param.options.label + ' : ' + param.value)
            init()
        })
        return [label, slider, value]
    }
    const ratio = window.innerWidth / window.innerHeight

    sketch.init = () => {
        topoPoints = []

        for (let i = 0; i < numPoints; i++) {
            topoPoints.push({
                pos: p5.createVector(
                    p5.randomGaussian(p5.width / 2, p5.width / 8),
                    p5.randomGaussian(p5.height / 2, p5.height / 8)
                ),
                angle: p5.random(p5.TWO_PI),
                height: 0
            })
        }

        p5.background(255)
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
        p5.randomSeed(p5.floor(p5.random(9999999)))

        const paramBox = document.createElement('div')
        paramBox.id = 'interactiveParameter'
        params.forEach((param) => {
            const elems = htmlParam(param, paramBox)
            elems.forEach((elem) => {
                paramBox.appendChild(elem)
            })
        })
        document.body.appendChild(paramBox)

        init()
    }

    p5.draw = () => {
        if (typeof topoPoints[0] !== 'undefined') {
            for (let i = 0; i < topoPoints.length; i++) {
                const nx = p5.map(topoPoints[i].pos.x, 0, p5.width, -1, 1)
                const ny = p5.map(topoPoints[i].pos.y, 0, p5.height, -1, 1)

                const np = pTransform.transform(
                    topoPoints[i].pos.x,
                    topoPoints[i].pos.y +
                        p5.width -
                        topoPoints[i].height * p5.height
                )

                p5.stroke(0, params[2].value)
                p5.point(np[0], np[1])

                /**
                 * Compute vectors
                 */
                const n1 =
                    p5.noise(nx * params[1].value, ny * params[1].value) *
                    params[0].value

                topoPoints[i].height = 0.75 + n1
                topoPoints[i].pos.x += p5.cos(topoPoints[i].angle) * scale
                topoPoints[i].pos.y += p5.sin(topoPoints[i].angle) * scale
                topoPoints[i].angle += n1
            }
        }
    }
}
export default sketch
