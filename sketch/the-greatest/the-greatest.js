import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import CanvasPictureSampler from './Canvas-picture-sampler'

const sample = new CanvasPictureSampler()

//ocument.body.appendChild(image)
const path = './assets/muhammad_ali_portrait-cropped.jpg'

const sketch = {
    init: () => {
        sketch.image = new Image()
        sketch.image.addEventListener('load', () => {
            sample.load(sketch.image)
            sketch.draw()
        })
        sketch.image.addEventListener('error', () => {
            console.warn('Can\t load the image at ', path)
        })
        sketch.image.crossOrigin = 'anonymous'
        sketch.image.alt = 'source'
        sketch.image.src = path
    },
    draw: () => {
        for (let t = 0; t < 25; t++) {
            const randomPos = [
                Math.floor(Math.random() * sketch.image.width),
                Math.floor(Math.random() * sketch.image.height)
            ]
            const color = sample.getColor(...randomPos)
            console.log('pixel [', ...randomPos, '] = ', color)
        }
    }
}
export default sketch
