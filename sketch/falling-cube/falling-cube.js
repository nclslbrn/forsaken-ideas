/// <reference path="../../node_modules/@types/p5/global.d.ts" />

import ease from '../../tools/ease'

const sketch = (p5) => {
    const N = 6
    let w, h
    const numFrame = 120

    const palette = [
        [46, 41, 78],
        [244, 96, 54],
        [27, 153, 139],
        [231, 29, 54],
        [197, 216, 109]
    ]
    const cube = (d) => {
        p5.push()
        p5.translate(0, d / 2, d / 2)
        for (let i = 0; i < 4; i++) {
            p5.push()
            p5.fill(palette[i % palette.length])
            p5.rotateY(p5.HALF_PI * i)
            p5.translate(-d / 2, -d, d / 2)
            p5.rect(0, 0, d, d)
            p5.pop()
        }

        for (let i = 0; i < 2; i++) {
            p5.push()
            p5.fill(palette[i % palette.length])
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
        /*
        p5.noLights()
        const cam = p5.camera(p5.width / 2, p5.height / 2, p5.height)
        cam.lookAt(p5.width / 2, p5.height / 2, p5.height / 2)
        setCamera(cam)
        */

        w = p5.ceil(p5.width / N)
        h = p5.ceil(p5.height / N)
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        p5.background(0)
        /*
        p5.ambientLight(255)
        p5.directionalLight(
            255,
            255,
            255,
            p5.width / 2,
            p5.height / 2,
            p5.height
        )
        */
        p5.push()
        p5.translate(-p5.width / 2, -p5.height / 2 + t * -w, -p5.height / 2)
        for (let x = 0; x <= N + 2; x++) {
            for (let y = 0; y <= N + 2; y++) {
                const index = (N / 2) * x + y
                const t_ = 1.0 - ((p5.frameCount + index) % numFrame) / numFrame

                p5.push()

                p5.translate(
                    x * w + (y % 2 == 0 ? w / 2 : 0),
                    y * h,
                    (N * 1.3 - y) * h
                )

                p5.rotateX(p5.QUARTER_PI)
                p5.rotateY(p5.QUARTER_PI)
                p5.rotateZ(p5.QUARTER_PI + p5.TWO_PI * ease(t_))

                cube(w)
                p5.pop()
            }
        }
        p5.pop()
    }
}
export default sketch
