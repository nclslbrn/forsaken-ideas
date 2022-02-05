import * as tome from 'chromotome'
import Notification from '../../src/js/sketch-common/Notification'

const sketch = (p5) => {
    let canvas, sample, move, palette, nIter

    const iteration = 75,
        noiseStrength = 15,
        noiseScale = 0.007,
        container = document.getElementById('windowFrame')

    sketch.canvasSize = () => {
        const max = 800
        const side = window.innerWidth * 0.8
        return window.innerWidth < max ? [side, side] : [max, max]
    }
    sketch.init = () => {
        palette = tome.get()
        nIter = 0
        const colorNum = palette.colors.length
        p5.stroke(palette.background || palette.stroke || '#222')
        for (let x = 0; x < colorNum; x++) {
            for (let y = 0; y < colorNum; y++) {
                p5.fill(palette.colors[(x + y) % colorNum])
                p5.rect(
                    (x / colorNum) * p5.width,
                    (y / colorNum) * p5.height,
                    (1 / colorNum) * p5.width,
                    (1 / colorNum) * p5.height
                )
            }
        }
        sample = p5.get()
    }
    sketch.nextMove = () => {
        const goForward = Math.random() > 0.5
        const numFrame = 6 * Math.ceil(Math.random() * 4)
        const stepSize = 12 * Math.ceil(Math.random() * 12)
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
    sketch.export = () => {
        const date = new Date()
        const filename =
            'From-order-to-chaos' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            sample.sourceName
        p5.save(canvas, filename, 'png')
    }
    p5.setup = () => {
        canvas = p5.createCanvas(...sketch.canvasSize())
        p5.pixelDensity(window.devicePixelRatio)
        p5.strokeWeight(4)
        sketch.init()
        sketch.nextMove()
    }
    p5.draw = () => {
        if (p5.frameCount % move.numFrame === 0) {
            nIter++
            if (nIter == iteration) {
                console.log('Done')
                new Notification('Sketch done.', container, 'light', 3000)
            } else {
                sketch.nextMove()
            }
        } else if (nIter < iteration) {
            const copy = p5.get()
            let { goForward, step, isVertical, d, start, rect } = move

            const noise = noiseStrength * p5.noise(d * noiseScale)

            const disp = [
                (goForward ? -1 : 1) * isVertical
                    ? Math.cos(noise * 2 * Math.PI) * step
                    : d,
                (goForward ? -1 : 1) * isVertical
                    ? d
                    : Math.sin(noise * 2 * Math.PI) * step
            ]
            const src = {
                x: start[0],
                y: start[1],
                w: rect[0],
                h: rect[1]
            }
            const dest = {
                x: start[0] + disp[0],
                y: start[1] + disp[1],
                w: rect[0] * 2,
                h: rect[1] * 2
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
    }
    p5.windowResized = () => {
        p5.resizeCanvas(...sketch.canvasSize())
    }
}
export default sketch
