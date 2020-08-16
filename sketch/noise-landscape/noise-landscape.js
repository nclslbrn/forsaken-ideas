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
    const setupParamInteraction = () => {
        const paramBox = document.createElement('div')
        paramBox.id = 'interactiveParameter'
        const noiseScaleLabel = document.createElement('label')
        noiseScaleLabel.innerHTML = 'Noise scale'
        const noiseScaleSlider = document.createElement('input')
        noiseScaleSlider.type = 'range'
        noiseScaleSlider.min = 0.1
        noiseScaleSlider.max = 1
        noiseScaleSlider.step = 0.01
        noiseScaleSlider.value = noiseScale
        const noiseScaleValue = document.createElement('input')
        noiseScaleValue.type = 'text'
        noiseScaleValue.value = noiseScale

        const noiseSampleLabel = document.createElement('label')
        noiseSampleLabel.innerHTML = 'Noise sample'
        const noiseSampleSlider = document.createElement('input')
        noiseSampleSlider.type = 'range'
        noiseSampleSlider.min = 0.1
        noiseSampleSlider.max = 4.0
        noiseSampleSlider.step = 0.1
        noiseSampleSlider.value = noiseScale
        const noiseSampleValue = document.createElement('input')
        noiseSampleValue.type = 'text'
        noiseSampleValue.value = noiseSample

        const opacityLabel = document.createElement('label')
        opacityLabel.innerHTML = 'opacity'
        const opacitySlider = document.createElement('input')
        opacitySlider.type = 'range'
        opacitySlider.min = 0.1
        opacitySlider.max = 25
        opacitySlider.step = 0.1
        opacitySlider.value = opacity
        const opacityValue = document.createElement('input')
        opacityValue.type = 'text'
        opacityValue.value = opacity

        paramBox.appendChild(noiseScaleLabel)
        paramBox.appendChild(noiseScaleSlider)
        paramBox.appendChild(noiseScaleValue)

        paramBox.appendChild(noiseSampleLabel)
        paramBox.appendChild(noiseSampleSlider)
        paramBox.appendChild(noiseSampleValue)

        paramBox.appendChild(opacityLabel)
        paramBox.appendChild(opacitySlider)
        paramBox.appendChild(opacityValue)

        document.body.appendChild(paramBox)

        noiseScaleSlider.addEventListener('change', (event) => {
            noiseScale = noiseScaleSlider.value
            noiseScaleValue.value = noiseScale
            init()
        })
        noiseSampleSlider.addEventListener('change', (event) => {
            noiseSample = noiseSampleSlider.value
            noiseSampleValue.value = noiseSample
            init()
        })
        opacitySlider.addEventListener('change', (event) => {
            opacity = opacitySlider.value
            opacityValue.value = opacity
        })
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
        setupParamInteraction()
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

                p5.stroke(0, 25)
                p5.point(np[0], np[1])

                /**
                 * Compute vectors
                 */
                const n1 =
                    p5.noise(nx * noiseSample, ny * noiseSample) * noiseScale

                topoPoints[i].height = 0.75 + n1
                topoPoints[i].pos.x += p5.cos(topoPoints[i].angle) * scale
                topoPoints[i].pos.y += p5.sin(topoPoints[i].angle) * scale
                topoPoints[i].angle += n1
            }
        }
    }
}
export default sketch
