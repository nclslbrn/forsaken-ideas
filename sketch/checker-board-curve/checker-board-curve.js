import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'

const sketch = (p5) => {
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    let colors, sketchDim, center
    const numFrame = 320
    const init = () => {
        sketchDim = sketchSize()
        center = { x: sketchDim.w / 2, y: sketchDim.h / 2 }
        colors = generateHslaColors(75, 60, 100, 2).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
        p5.fill(colors[1])
    }
    p5.setup = () => {
        init()
        p5.createCanvas(sketchDim.w, sketchDim.h)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        p5.noStroke()
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const t2 = p5.map(t, 0, 1, 5, 10)

        p5.background(colors[0])
        p5.beginShape()
        for (let theta = 0; theta < Math.PI * 2; theta += 0.05) {
            const x =
                center.x +
                Math.cos(theta) * Math.cos(theta * t2) * (sketchDim.w / 3)

            const y =
                center.y +
                Math.sin(theta) * Math.sin(theta * t2) * (sketchDim.h / 3)

            p5.vertex(x, y)
        }
        p5.endShape()
    }
    p5.windowResized = () => {
        init()
        center = { x: sketchDim.w / 2, y: sketchDim.h / 2 }
        p5.resizeCanvas(sketchDim.w, sketchDim.h)
    }
    sketch.init = init
}
export default sketch
