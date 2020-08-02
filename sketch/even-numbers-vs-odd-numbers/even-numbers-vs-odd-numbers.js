/// <reference path="../../node_modules/@types/p5/global.d.ts" />
import { newExpression } from 'babel-types'

import ease from '../../tools/ease'
import * as tome from 'chromotome'

const sketch = (p5) => {
    const N = 5
    const odd = []
    const even = []
    const numFrame = 120
    const shapeColorId = []
    let s, palette

    const drawThis = (posX, posY, s, t, tt, odd) => {
        let last = null
        const step = p5.TWO_PI / 4
        const size = s * (odd ? tt : 1 - tt)
        const displace = 0

        p5.beginShape()

        for (let theta = 0; theta <= p5.TWO_PI; theta += step) {
            const rot = odd
                ? p5.QUARTER_PI * tt - theta - step * t
                : theta + step * t
            const current = {
                x: posX + displace + size * p5.cos(rot),
                y: posY + displace + size * p5.sin(rot)
            }
            if (last) {
                p5.vertex(current.x, current.y)
            }
            last = current
        }
        p5.endShape(p5.CLOSE)
    }

    p5.setup = () => {
        const sketchSize = p5.min(window.innerWidth, 800)
        palette = tome.get()

        p5.createCanvas(sketchSize, sketchSize)
        p5.noStroke()
        //p5.colorMode(p5.HSB, N * N * 3, 1, 1, 1)
        s = sketchSize / N

        for (let x = 0; x <= N; x++) {
            for (let y = 0; y <= N; y++) {
                if (
                    (x % 2 == 0 && y % 2 == 0) ||
                    (x % 2 !== 0 && y % 2 !== 0)
                ) {
                    odd.push({ x: x * s, y: y * s })
                } else {
                    even.push({ x: x * s, y: y * s })
                }
                shapeColorId.push((y * N + x) % 2)
            }
        }
    }

    p5.draw = () => {
        const t = p5.pow((p5.frameCount % numFrame) / numFrame, 2)
        const tt = ease(t < 0.5 ? t + t : 2 - (t + t))

        p5.background(0)

        for (let o in odd) {
            p5.fill(palette.colors[shapeColorId[o]])
            drawThis(odd[o].x, odd[o].y, s, t, tt, true)
        }

        for (let e in even) {
            p5.fill(palette.colors[shapeColorId[e]])
            drawThis(even[e].x, even[e].y, s, 1 - t, tt, false)
        }
    }
}
export default sketch
