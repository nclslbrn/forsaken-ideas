import * as tome from 'chromotome'

const sketch = (p5) => {
    const N = 13
    const odd = []
    const even = []
    const numFrame = 160
    const shapeColorId = []
    let s, palette, sumSquare, animScale
    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    const drawThis = (posX, posY, s, t, tt, odd, i) => {
        let last = null
        const step = p5.TWO_PI / 4
        const size = s * (odd ? tt : 1 - tt)
        const displace = 0

        p5.beginShape()

        for (let theta = 0; theta <= p5.TWO_PI; theta += step) {
            const rot = odd
                ? theta + step * (t * i) + p5.HALF_PI * (tt * i)
                : theta + step * (t * i) + p5.HALF_PI * (tt * i)
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
        const sketchDim = sketchSize()
        palette = tome.get()

        p5.createCanvas(sketchDim.w, sketchDim.h)
        p5.noStroke()
        s = sketchDim.w / N

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
        sumSquare = p5.max(odd.length, even.length)
        animScale = sumSquare + numFrame / (N * 2)
    }

    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t < 0.5 ? t + t : 2 - (t + t)
        const frame = p5.frameCount % numFrame

        p5.background(0)

        for (let o in odd) {
            const index = o > sumSquare / 2 ? sumSquare - o : o
            const i = p5.map((frame + index) / animScale, 0, animScale, 0, 1)
            p5.fill(palette.colors[shapeColorId[o]])
            drawThis(odd[o].x, odd[o].y, s, t, tt, true, i)
        }

        for (let e in even) {
            const index = e > sumSquare / 2 ? sumSquare - e : e
            const i = p5.map((frame + index) / animScale, 0, animScale, 0, 1)
            p5.fill(palette.colors[shapeColorId[e]])
            drawThis(even[e].x, even[e].y, s, 1 - t, tt, false, i)
        }
    }
}
export default sketch
