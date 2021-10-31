import samples from './assets'
// TODO
// 1. Save image function
// 2. Image author (right)
const sketch = (p5) => {
    let sample,
        move,
        images = [],
        sampleID = false,
        density = 1
    sketch.nextMove = () => {
        const goForward = Math.random() > 0.5
        const numFrame = 12 * Math.ceil(Math.random() * 4)
        const stepSize = 8 * Math.ceil(Math.random() * 16)
        const isVerticalSample = Math.random() > 0.5
        // Image sample & canvas must be 1:1 ratio
        const size = Math.random() * p5.width

        move = {
            goForward: goForward,
            step: stepSize,
            // describe rect size to adapt movement
            isVertical: isVerticalSample,
            // initial displacement value
            d: goForward ? numFrame : 0,
            // how many frames the movement lasts
            numFrame: numFrame,
            // rect size where size > stepSize
            rect: isVerticalSample ? [stepSize, size] : [size, stepSize],
            // rect position
            start: [Math.random() * p5.width, Math.random() * p5.height]
        }
    }
    sketch.init = () => {
        sampleID = Math.floor(Math.random() * samples.length)
        sample = images[sampleID].get()
        sketch.nextMove()
    }
    p5.preload = () => {
        samples.forEach((sample) =>
            images.push(p5.loadImage(`./assets/${sample.sourceName}`))
        )
        density = p5.pixelDensity()
    }
    p5.setup = () => {
        p5.createCanvas(800, 800)
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % move.numFrame === 0) {
            sketch.nextMove()
        } else {
            const copy = sample
            const { goForward, step, isVertical, d, start, rect } = move
            // https://p5js.org/reference/#/p5/image
            const src = {
                x: start[0],
                y: start[1],
                w: rect[0],
                h: rect[1]
            }
            const dest = {
                x: start[0] + (goForward ? -1 : 1) * (isVertical ? d : 0),
                y: start[1] + (goForward ? -1 : 1) * (isVertical ? 0 : d),
                w: rect[0],
                h: rect[1]
            }
            sample.copy(
                copy,
                dest.x,
                dest.y,
                dest.w,
                dest.h,
                src.x,
                src.y,
                src.w,
                src.h
            )
            p5.image(sample, 0, 0, p5.width, p5.height)
            move.d++
        }
        /* 
        const rect = [Math.random() * p5.width, Math.random() * p5.height]
        const start = [Math.random() * p5.width, Math.random() * p5.height]
        const move = [Math.random() * p5.width, Math.random() * p5.height]
       */
    }
}
export default sketch
