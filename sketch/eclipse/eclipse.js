import * as tome from 'chromotome'
import ease from '../../tools/ease'

let palette = tome.get()

const sketch = (p5) => {
    const numFrame = 512
    const circleMargin = 12
    const arcWidth = 32
    const arcPerCircle = 5
    const circleNum = window.innerHeight / (circleMargin + arcWidth) / 2
    const angleStep = p5.TWO_PI / arcPerCircle
    const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.noStroke()
    }
    p5.draw = () => {
        if (palette.background) {
            p5.background(palette.background)
        } else if (palette.stroke) {
            p5.background(palette.stroke)
        } else {
            p5.background(25)
        }

        let t =
            1 *
            (p5.frameCount < numFrame
                ? p5.frameCount / numFrame
                : (p5.frameCount % numFrame) / numFrame)

        let _a = p5.TWO_PI * t
        let _b = (1 - t) * p5.TWO_PI

        for (let r = 0; r < circleNum; r++) {
            p5.strokeWeight(r * 2)
            const rot = r % 2 == 0 ? _a : _b

            for (let a = 0; a < arcPerCircle; a++) {
                const color_id =
                    r + a < palette.colors.length
                        ? r + a
                        : (r + a) % palette.colors.length
                const radius = r * arcWidth
                const position = {
                    x: center.x + radius * p5.cos(r + _a),
                    y: center.y + radius * p5.sin(r + _b)
                }
                let shapeColor = p5.color(palette.colors[color_id])
                shapeColor.setAlpha(75)
                p5.fill(shapeColor)
                p5.beginShape()
                for (let a = 0; a <= arcPerCircle; a++) {
                    p5.vertex(
                        position.x + radius * p5.cos(a * angleStep + rot),
                        position.y + radius * p5.sin(a * angleStep + rot)
                    )
                }
                p5.endShape(p5.CLOSE)
            }
        }
    }
}

export default sketch
