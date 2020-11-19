import ease from '../../src/js/sketch-common/ease'

const pinSpiral = (p5) => {
    const res = 0.025
    const numFrame = 60
    let maxRadius, center, d
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    p5.setup = () => {
        const canvasSize = sketchSize()
        p5.createCanvas(canvasSize.w, canvasSize.h)
        p5.colorMode(p5.HSB, 1, 1, 1, 1)
        maxRadius = Math.min(canvasSize.w, canvasSize.h) * 0.35
        d = maxRadius * 0.01
        center = { x: canvasSize.w / 2, y: canvasSize.h / 2 }
    }
    p5.draw = () => {
        p5.background(0)

        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t < 0.5 ? t + t : 2 - (t + t)

        for (let i = 0; i < 1; i += res) {
            const radius = maxRadius * i
            for (let j = 0; j < 1; j += res / i) {
                const theta = Math.PI * 2 * j
                const ij =
                    (((4 / res) * (i + j) + p5.frameCount) % numFrame) /
                    numFrame
                const r1 = radius * Math.cos(ij)
                const r2 = radius * Math.sin(ij)
                const r = p5.lerp(r1, r2, ij)

                p5.stroke(0.5 + ease(ij, 5) / 2, 0.5, 0.7, 1)

                const p1 = {
                    x: ease(ij, 5) * d + center.x + radius * Math.cos(theta),
                    y: center.y + radius * Math.sin(theta)
                }
                const p2 = {
                    x: center.x + r * Math.cos(theta),
                    y: (ease(ij, 5) - 0.5) * d + center.y + r * Math.sin(theta)
                }
                p5.line(p1.x, p1.y, p2.x, p2.y)
            }
        }
    }
    p5.windowResized = () => {
        const canvasSize = sketchSize()
        p5.resizeCanvas(canvasSize.w, canvasSize.h)
    }
}
export default pinSpiral
