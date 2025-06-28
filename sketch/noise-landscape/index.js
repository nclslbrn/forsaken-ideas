import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
import Perspective from './perspective-transform'
import paramSlider from '../../sketch-common/param-slider'
import Fbm from '../../sketch-common/Fbm'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas
const sketch = (p5) => {
    const scale = 3
    const numPoints = 3000
    let topoPoints, pTransform, fbm
    let noiseScale = 0.5
    let noiseSample = 5
    let opacity = 12.5
    const squeeze_y = 0.45
    const perspective_x = 0.75

    sketch.init = () => {
        fbm = new Fbm({
            frequency: 0.03,
            octaves: 7,
            amplitude: 0.15,
            seed: String(Math.floor(Math.random() * 9999))
        })
        topoPoints = []

        for (let i = 0; i < numPoints; i++) {
            topoPoints.push({
                pos: p5.createVector(
                    p5.randomGaussian(p5.width / 2, p5.width / 4),
                    p5.randomGaussian(p5.height / 2, p5.height / 4)
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
        const noiseScaleParam = paramSlider(
            {
                value: noiseScale,
                options: {
                    min: 0.1,
                    max: 1,
                    step: 0.1,
                    label: 'Noise scale'
                },
                callback: sketch.init
            },
            noiseScale
        )
        const noiseSampleParam = paramSlider(
            {
                value: noiseSample,
                options: {
                    min: 0.1,
                    max: 10.0,
                    step: 0.1,
                    label: 'Noise sample'
                },
                callback: sketch.init
            },
            noiseSample
        )
        const opacityParam = paramSlider(
            {
                value: opacity,
                options: {
                    min: 0.1,
                    max: 25,
                    step: 0.1,
                    label: 'Opacity'
                },
                callback: sketch.init
            },
            opacity
        )
        noiseScaleParam.map((e) => paramBox.appendChild(e))
        noiseSampleParam.map((e) => paramBox.appendChild(e))
        opacityParam.map((e) => paramBox.appendChild(e))
        paramBox.style = `
            position: absolute;
            bottom: 1em;
            left: 1em;

            width: 200px;
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
        `
        document.body.appendChild(paramBox)
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
        pTransform = new Perspective(srcCorners, dstCorners)
        p5.randomSeed(p5.floor(p5.random(9999999)))
        setupParamInteraction()
        init()
    }

    p5.draw = () => {
        if (typeof topoPoints[0] !== 'undefined') {
            for (let i = 0; i < topoPoints.length; i++) {
                const nx = p5.map(topoPoints[i].pos.x, 0, p5.width, -0.8, 0.8)
                const ny = p5.map(topoPoints[i].pos.y, 0, p5.height, -0.6, 1.2)

                const np = pTransform.transform([
                    topoPoints[i].pos.x,
                    topoPoints[i].pos.y +
                        p5.width -
                        topoPoints[i].height * p5.height
                ])

                p5.stroke(0, 25)
                p5.point(np[0], np[1])

                /**
                 * Compute vectors
                 */
                const n1 =
                    fbm.f(nx * noiseSample, ny * noiseSample) * noiseScale

                topoPoints[i].height = 0.5 + n1
                topoPoints[i].pos.x += p5.cos(topoPoints[i].angle) * scale
                topoPoints[i].pos.y += p5.sin(topoPoints[i].angle) * scale
                topoPoints[i].angle += n1 * 0.1
            }
        }
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.download = sketch.exportPNG
window.infobox = infobox
handleAction()
