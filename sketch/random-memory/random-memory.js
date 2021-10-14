import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import CanvasPictureSampler from './Canvas-picture-sampler'
import SimplexNoise from 'simplex-noise'
import Notification from '../../src/js/sketch-common/Notification'
const frame = document.getElementById('windowFrame')

const sketch = {
    scale: 1,
    tracer: new SvgTracer({
        parentElem: frame,
        size: 'P24x32',
        dpi: 300
    }),

    sampler: new CanvasPictureSampler(),
    simplex: new SimplexNoise(),
    resetImage: () => {
        const date = new Date(),
            H = date.getHours(),
            i = date.getMinutes(),
            s = date.getSeconds()
        sketch.sampler.clear()
        sketch.image.src = `https://source.unsplash.com/56x74/?portrait&last=${H}-${i}-${s}`
    },
    init: () => {
        sketch.tracer.init()
        sketch.margin = sketch.tracer.cmToPixels(3)
        // sketch.imageNum = Math.floor(Math.random() * 4)
        sketch.image = new Image()
        sketch.image.id = 'sample'
        sketch.image.crossOrigin = 'anonymous'
        document.body.appendChild(sketch.image)

        sketch.resetImage()
        frame.appendChild(sketch.sampler.canvas)

        sketch.image.onload = function () {
            console.log(sketch.image.src)
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
        const pathLength = 0.3
        for (let x = 0; x < sketch.image.width; x++) {
            for (let y = 0; y < sketch.image.height; y++) {
                const color = sketch.sampler.getColor(x, y)
                const angle = sketch.simplex.noise2D(
                    x / sketch.scale,
                    y / sketch.scale
                )
                // const angle = noise * Math.PI * 2
                const lightness = (color.r + color.g + color.b) / 765
                const weight = (1 - lightness) * sketch.scale
                /* sketch.tracer.rect({
                    x: (0.25 + x) * sketch.scale,
                    y: (0.25 + y) * sketch.scale,
                    w: sketch.scale,
                    h: sketch.scale,
                    fill: `rgba(${color.r}, ${color.g}, ${color.b}, ${
                        color.a / 255
                    })`
                }) */
                const d = {
                    x: x * sketch.scale + sketch.scale / 2 + sketch.margin,
                    y: y * sketch.scale + sketch.scale / 2 + sketch.margin
                }
                sketch.tracer.path({
                    points: [
                        [
                            d.x - Math.cos(angle) * (sketch.scale * pathLength),
                            d.y - Math.sin(angle) * (sketch.scale * pathLength)
                        ],
                        [
                            d.x + Math.cos(angle) * (sketch.scale * pathLength),
                            d.y + Math.sin(angle) * (sketch.scale * pathLength)
                        ]
                    ],
                    stroke: 'black',
                    strokeWidth: weight,
                    close: false
                })
            }
        }
    },
    download: () => {
        sketch.tracer.export({
            name: `random-memory`
        })
    }
}
export default sketch
