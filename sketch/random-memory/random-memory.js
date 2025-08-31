import SvgTracer from '../../sketch-common/svg-tracer'
import CanvasPictureSampler from './Canvas-picture-sampler'
import { createNoise2D } from 'simplex-noise'
import Notification from '../../sketch-common/Notification'
//import './assets/harold.png'
const frame = document.getElementById('windowFrame')

const sketch = {
    input: document.createElement('input'),
    rememberBox: document.createElement('div'),
    rememberText: document.createElement('p'),
    scale: [1, 1],
    tracer: new SvgTracer({
        parentElem: frame,
        size: 'P24x32',
        dpi: 300
    }),
    sampler: new CanvasPictureSampler(),
    simplex: createNoise2D(),
    resetImage: () => {
        sketch.sampler.clear()
        sketch.image = new Image()
        sketch.lines = []
        sketch.image.src = `./harold.png`
    },
    init: () => {
        sketch.tracer.init()
        sketch.margin = sketch.tracer.cmToPixels(0.5)
        sketch.image = new Image()
        sketch.image.src = `./harold.png`
        sketch.image.id = 'sample'
        sketch.image.crossOrigin = 'anonymous'
        document.body.appendChild(sketch.image)
        sketch.input.type = 'file'
        sketch.input.accept = 'image/jpeg, image/png, image/gif'

        sketch.resetImage()
        sketch.rememberBox.appendChild(sketch.sampler.canvas)
        sketch.rememberBox.appendChild(sketch.input)
        sketch.rememberBox.appendChild(sketch.rememberText)
        sketch.rememberBox.style.marginLeft = '1em'
        frame.appendChild(sketch.rememberBox)

        sketch.image.onload = function () {
            sketch.rememberText.innerHTML =
                sketch.image.attributes.src.nodeValue
            const printZone = [
                sketch.tracer.width - sketch.margin * 2,
                sketch.tracer.height - sketch.margin * 2
            ]
            sketch.scale = [
                Math.round(printZone[0] / 56),
                Math.round(printZone[1] / 74)
            ]
            sketch.sampler.load(sketch.image, sketch.draw)
            sketch.draw()
        }

        sketch.sampler.canvas.addEventListener('click', () => {
            sketch.tracer.clear()
            sketch.resetImage()
        })
    },
    draw: () => {
        const pathLength = 0.5

        for (let x = 0; x < sketch.sampler.canvas.width; x++) {
            for (let y = 0; y < sketch.sampler.canvas.height; y++) {
                const color = sketch.sampler.getColor(x, y)
                const angle = sketch.simplex(
                    x / sketch.scale[0],
                    y / sketch.scale[1]
                )
                const lightness = (color.r + color.g + color.b) / 765
                const weight = (1 - lightness) * sketch.scale[0] * 0.75

                const d = {
                    x:
                        x * sketch.scale[0] +
                        sketch.scale[0] / 2 +
                        sketch.margin,
                    y: y * sketch.scale[1] + sketch.scale[1] / 2 + sketch.margin
                }

                const v = [
                    [
                        d.x + Math.cos(angle) * (sketch.scale[0] * pathLength),
                        d.y + Math.sin(angle) * (sketch.scale[1] * pathLength)
                    ],
                    [
                        d.x - Math.cos(angle) * (sketch.scale[0] * pathLength),
                        d.y - Math.sin(angle) * (sketch.scale[1] * pathLength)
                    ]
                ]
                // Store line to export them
                sketch.lines.push([v, weight / 2, angle])
                // draw as line(2 points)
                sketch.tracer.path({
                    points: v,
                    stroke: 'black',
                    strokeWidth: weight,
                    close: false
                })
            }
        }
    },
    download: () => {
        sketch.tracer.clear()
        sketch.lines.forEach((line) => {
            const [v, weight, angle] = line
            const points = [
                [
                    v[0][0] + Math.cos(Math.PI * 0.5 + angle) * weight,
                    v[0][1] + Math.sin(Math.PI * 0.5 + angle) * weight
                ],
                [
                    v[0][0] + Math.cos(Math.PI * 1.5 + angle) * weight,
                    v[0][1] + Math.sin(Math.PI * 1.5 + angle) * weight
                ],
                [
                    v[1][0] + Math.cos(Math.PI * 1.5 + angle) * weight,
                    v[1][1] + Math.sin(Math.PI * 1.5 + angle) * weight
                ],
                [
                    v[1][0] + Math.cos(Math.PI * 0.5 + angle) * weight,
                    v[1][1] + Math.sin(Math.PI * 0.5 + angle) * weight
                ]
            ]
            // draw as path (4 points)
            sketch.tracer.path({
                points: points,
                fill: 'black',
                close: true
            })
        })
        sketch.tracer.export({
            name: `random-memory`
        })
    }
}
export default sketch
