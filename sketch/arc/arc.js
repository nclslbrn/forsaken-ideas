import * as tome from 'chromotome'
import perspective from 'perspective-transform'
import Strip from './Strip'
const randInt = (interval) => {
    return (
        Math.floor(Math.random() * (interval.max - interval.min)) + interval.min
    )
}
const sketch = (p5) => {
    let palette,
        pTransform,
        strips = [],
        surface = []
    const stripSizes = { min: 36, max: 128 }
    const stripAngleSizes = { min: 0.3, max: 1.5 }
    const surfaceBreaks = { min: 4, max: 16 }
    const squeeze_y = 0.35
    const perspective_x = 0.9

    sketch.init = () => {
        palette = tome.get()
        strips = []
        for (let i = 0; i < randInt(stripSizes); i++) {
            strips.push(
                new Strip({
                    color: randInt({ min: 0, max: palette.colors.length }),
                    radius: Math.random() * window.innerHeight,
                    startAngle: Math.random() * Math.PI * 2,
                    angle:
                        Math.random() *
                            (stripAngleSizes.max - stripAngleSizes.min) +
                        stripAngleSizes.min
                })
            )
        }
    }
    sketch.initSurface = () => {
        surface = []
        const flatStep = randInt({ min: 4, max: 12 })
        const breaks = randInt(surfaceBreaks)
        for (let i = 0; i < flatStep; i++) surface.push(2)
        for (let j = 0; j < breaks; j++)
            surface.push((j * 100) / (breaks * 10 * j))
    }

    p5.setup = () => {
        sketch.init()
        sketch.initSurface()
        p5.createCanvas(window.innerWidth, window.innerHeight)
        const pad_x = (p5.width - p5.width * perspective_x) / 2
        const pad_y = (p5.height - p5.height * squeeze_y) / 2
        const srcCorners = [
            0,
            0,
            p5.width,
            0,
            p5.width,
            p5.height,
            0,
            p5.height
        ]
        const dstCorners = [
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

        p5.noLoop()
        p5.noFill()
    }

    p5.draw = () => {
        p5.background(palette.background || palette.stroke || '#000')
        p5.push()
        p5.translate(p5.width / 2, p5.height / 2)

        for (let i = 0; i < strips.length; i++) {
            p5.stroke(palette.colors[strips[i].color])

            const lines = strips[i].getPoints()
            for (let j = 0; j < lines.length; j++) {
                p5.beginShape()
                const p1 = p5.createVector(lines[j][0].x, lines[j][0].y, 0)
                const p2 = p5.createVector(lines[j][1].x, lines[j][1].y, 0)

                for (let k = 0; k < surface.length; k++) {
                    const p = p1.lerp(p2.x, p2.y, 0, k / surface.length)
                    const tp = pTransform.transform(
                        p.x,
                        p.y + p5.height - p5.height * surface[k]
                    )

                    p5.vertex(tp[0], tp[1])
                }
                p5.endShape()
            }
        }

        p5.pop()
    }
    p5.mouseClicked = (fxn) => {
        sketch.initSurface()
        p5.redraw()
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
