import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import CanvasPictureSampler from './Canvas-picture-sampler'
import { createNoise2D } from 'simplex-noise'
import Notification from '../../src/js/sketch-common/Notification'
import memory from './memory'
const frame = document.getElementById('windowFrame')
const unsplashLinkPrefix = 'https://unsplash.com/photos/'

const sketch = {
    rememberBox: document.createElement('div'),
    rememberText: document.createElement('p'),
    pictNum: 0,
    scale: 1,
    tracer: new SvgTracer({
        parentElem: frame,
        size: 'P24x32',
        dpi: 300
    }),
    sampler: new CanvasPictureSampler(),
    simplex: createNoise2D(),
    resetImage: () => {
        sketch.sampler.clear()
        sketch.image.src = `https://source.unsplash.com/${memory[sketch.pictNum][0]
            }/56x74/`
        const openLink = unsplashLinkPrefix + memory[sketch.pictNum][0]
        sketch.rememberText.innerHTML = `<p>${memory[sketch.pictNum][1]}</p>`
        sketch.rememberText.innerHTML += `<p>Open the original on <a href='${openLink}' target='blank'>unsplash.com</a></p>`
        sketch.lines = []
        sketch.pictNum++
        if (sketch.pictNum === memory.length) sketch.pictNum = 0
    },
    init: () => {
        sketch.tracer.init()
        sketch.margin = sketch.tracer.cmToPixels(3)
        sketch.image = new Image()
        sketch.image.id = 'sample'
        sketch.image.crossOrigin = 'anonymous'
        document.body.appendChild(sketch.image)

        sketch.resetImage()
        sketch.rememberBox.appendChild(sketch.sampler.canvas)
        sketch.rememberBox.appendChild(sketch.rememberText)
        sketch.rememberBox.style.marginLeft = '1em'
        frame.appendChild(sketch.rememberBox)

        sketch.image.onload = function () {
            const printZone = sketch.tracer.width - sketch.margin * 2
            sketch.scale = Math.round(printZone / sketch.image.width)
            sketch.sampler.load(sketch.image, sketch.draw)
            sketch.draw()
        }

        sketch.sampler.canvas.addEventListener('click', () => {
            sketch.tracer.clear()
            sketch.resetImage()
        })
        new Notification(
            'You can change the image by clicking on the thumbnail and waiting (a lot).<br>Image source : <a target="blank" href="https://source.unsplash.com/">Unsplash.com</a>',
            frame,
            'light',
            15000
        )
    },
    draw: () => {
        console.log('draw')
        const pathLength = 0.5
        for (let x = 0; x < sketch.image.width; x++) {
            for (let y = 0; y < sketch.image.height; y++) {
                const color = sketch.sampler.getColor(x, y)
                const angle = sketch.simplex(
                    x / sketch.scale,
                    y / sketch.scale
                )
                const lightness = (color.r + color.g + color.b) / 765
                const weight = (1 - lightness) * sketch.scale

                const d = {
                    x: x * sketch.scale + sketch.scale / 2 + sketch.margin,
                    y: y * sketch.scale + sketch.scale / 2 + sketch.margin
                }

                const v = [
                    [
                        d.x + Math.cos(angle) * (sketch.scale * pathLength),
                        d.y + Math.sin(angle) * (sketch.scale * pathLength)
                    ],
                    [
                        d.x - Math.cos(angle) * (sketch.scale * pathLength),
                        d.y - Math.sin(angle) * (sketch.scale * pathLength)
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
