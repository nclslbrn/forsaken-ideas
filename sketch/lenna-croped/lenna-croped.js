import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'

const sketch = (p5) => {
    let rectSize, canvasSize, palette, img
    const numFrame = 460
    const res = 1 / 3
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return side > 800 ? 800 : side * 0.85
    }
    const _x = (x) => {
        return (x / p5.width) * img.width
    }

    const _y = (y) => {
        return (y / p5.height) * img.height
    }
    p5.preload = () => {
        img = p5.loadImage('./assets/Lenna.png')
    }

    p5.setup = () => {
        canvasSize = sketchSize()
        p5.createCanvas(canvasSize, canvasSize)
        p5.rectMode(p5.CENTER)
        p5.imageMode(p5.CENTER)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.noStroke()
        palette = generateHslaColors(75, 50, 50, 2).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
        rectSize = Math.max(p5.width, p5.height) * res * 0.5
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const s = 2.5 + t

        p5.background(270, 50, 15, 75)
        p5.push()
        p5.translate(p5.width * 0.5, p5.height * 0.5)
        //p5.image(img, 0, 0, p5.width, p5.height)

        for (let i = -s; i <= s; i += res) {
            for (let j = -s; j <= s; j += res) {
                const k = {
                    x: Math.cos(i) / Math.atan(j - i),
                    y: Math.atan(j) * Math.cos(i)
                }
                const l = { x: Math.sin(k.x), y: Math.sin(k.y) }
                const m = { x: l.x * p5.width, y: l.y * p5.height }
                const r = {
                    w: rectSize * Math.abs(0.5 - Math.cos(i)),
                    h: rectSize * Math.abs(0.5 - Math.cos(i))
                }

                p5.fill(
                    p5.lerpColor(palette[0], palette[1], Math.abs(i + j) / 2.0)
                )
                p5.text(`[x: ${i.toFixed(2)} | y: ${j.toFixed(2)}]`, m.x, m.y)

                /*  p5.image(
                    img,
                    Math.abs(i) * p5.width,
                    Math.abs(j) * p5.height,
                    r.w,
                    r.h,
                    m.x,
                    m.y,
                    r.w,
                    r.h
                ) */
                p5.image(
                    img,
                    m.x,
                    m.y,
                    r.w * 3,
                    r.h * 3,
                    _x(Math.abs(i) * img.width),
                    _y(Math.abs(j) * img.height),
                    r.w * 4,
                    r.h * 4
                )
                //p5.rect(m.x, m.y, r.w, r.h)
            }
        }

        p5.pop()
    }
}

export default sketch
