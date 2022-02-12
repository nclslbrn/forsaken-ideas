//import * as tome from 'chromotome'
import Notification from '../../src/js/sketch-common/Notification'
import getPalette from './palette'

const sketch = (p5) => {
    let canvas, sample, move, palette, nIter, iteration

    const maxIteration = 100,
        noiseScale = 0.05,
        container = document.getElementById('windowFrame')

    sketch.canvasSize = () => {
        const max = 800
        const side = window.innerWidth * 0.8
        return window.innerWidth < max ? [side, side] : [max, max]
    }
    sketch.init = () => {
        palette = [...getPalette()]
        p5.shuffle(palette)
        if (Math.random() > 0.5) palette.splice(0, 1)
        p5.stroke(palette[0])
        palette.splice(0, 1)
        for (let x = 0; x < palette.length; x++) {
            for (let y = 0; y < palette.length; y++) {
                p5.fill(palette[(x + y) % palette.length])
                p5.rect(
                    (x / palette.length) * p5.width,
                    (y / palette.length) * p5.height,
                    (1 / palette.length) * p5.width,
                    (1 / palette.length) * p5.height
                )
            }
        }
        nIter = 0
        iteration = Math.round((1 / palette.length) * maxIteration * 2)
        console.log(palette.length, ' => ', iteration)
        sample = p5.get()
    }
    sketch.nextMove = () => {
        const goForward = Math.random() > 0.5
        const numFrame = 2 * Math.ceil(Math.random() * 4)
        const stepSize = p5.map(nIter, 0, iteration, p5.width * 0.1, 24)
        const isVerticalSample = Math.random() > 0.5
        // Image sample & canvas must be 1:1 ratio
        const size = p5.map(nIter, 0, iteration, p5.width * 2, p5.width * 0.2)

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
            'Recomposed' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
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

            const noise = p5.noise(d * noiseScale, iteration * noiseScale)

            const disp = [
                (goForward ? -1 : 1) * isVertical
                    ? Math.cos(noise * Math.PI * 2) * step
                    : d,
                (goForward ? -1 : 1) * isVertical
                    ? d
                    : Math.sin(noise * Math.PI * 2) * step
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
                w: rect[0] * (Math.random() / 2 + 1),
                h: rect[1] * (Math.random() / 2 + 1)
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
            move.goForward ? move.d-- : move.d++
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(...sketch.canvasSize())
    }
}
export default sketch
