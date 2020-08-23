/// <reference path="../../node_modules/@types/p5/global.d.ts" />

import ease from '../../src/js/sketch-common/ease'
import * as tome from 'chromotome'

const sketch = (p5) => {
    const N = 6
    const offset = 2
    let w, h, palette
    const numFrame = 120

    const cube = (d) => {
        p5.push()
        p5.translate(0, d / 2, 0)
        for (let i = 0; i < 4; i++) {
            p5.push()
            p5.fill(palette.colors[i % 2])
            p5.rotateY(p5.HALF_PI * i)
            p5.translate(-d / 2, -d, d / 2)
            p5.rect(0, 0, d, d)
            p5.pop()
        }

        for (let i = 0; i < 2; i++) {
            p5.push()
            p5.fill(palette.colors[1 + (i % 2)])
            p5.translate(0, -d / 2, 0)
            p5.rotateX(p5.HALF_PI + p5.PI * i)
            p5.translate(-d / 2, -d / 2, d / 2)
            p5.rect(0, 0, d, d)
            p5.pop()
        }
        p5.pop()
    }

    p5.setup = () => {
        p5.createCanvas(720, 720, p5.WEBGL)
        p5.ortho()
        p5.noStroke()
        palette = tome.get()

        w = p5.ceil(p5.width / N)
        h = p5.ceil(p5.height / N)
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        p5.background(0)
        p5.push()

        p5.translate((-N / 2) * h, (-N + 2 / 2) * h, 0)
        for (let x = 0; x <= N; x++) {
            for (let y = -offset; y <= N + offset; y++) {
                const index = (N + offset / 2) * x + y
                const t_ = 1.0 - ((p5.frameCount + index) % numFrame) / numFrame

                p5.push()
                p5.translate(
                    x * h + (y % 2 == 0 ? w / 2 : 0),
                    y * h + t * h * 2,
                    0
                )
                p5.rotateX(p5.QUARTER_PI)
                p5.rotateY(p5.PI * ease(t_))
                cube(w)
                p5.pop()
            }
        }
        p5.pop()
    }
}
export default sketch
