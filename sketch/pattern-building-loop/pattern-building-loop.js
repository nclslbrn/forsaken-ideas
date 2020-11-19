import p5 from 'p5'
import ease from '../../src/js/sketch-common/ease'

const patternBuildingLoop = (p5) => {
    const numFrame = 300
    const grid = { cols: 8, rows: 8 }
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    const canvasSize = sketchSize()
    const cell = {
        w: canvasSize.w / grid.cols,
        h: canvasSize.h / grid.rows
    }
    const r = Math.min(cell.w, cell.h) / 2
    p5.setup = () => {
        p5.createCanvas(canvasSize.w, canvasSize.h)
        p5.noStroke()
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t < 0.5 ? t + t : 2 - (t + t)

        p5.background(0)
        p5.fill(255)
        p5.push()
        p5.translate(0, cell.h * -0.5)

        for (let x = 0; x <= grid.cols; x++) {
            for (let y = 0; y <= grid.rows; y++) {
                const i = x + grid.cols * y
                const _t = ((p5.frameCount + i) % numFrame) / numFrame
                const _x = x * cell.w
                const _y = y * cell.h

                p5.beginShape()
                for (let a = 0; a < 1; a += 0.0125) {
                    const theta = Math.PI * 2 * a
                    const _r =
                        r *
                        2 *
                        Math.min(
                            Math.abs(Math.cos(theta)),
                            Math.abs(Math.sin(theta))
                        )

                    const rR = p5.lerp(r, _r, ease(_t, 50))
                    p5.vertex(
                        _x +
                            -ease(_t, 15) * cell.w * 0.5 +
                            rR * Math.cos(theta),
                        _y + ease(_t, 15) * cell.h + rR * Math.sin(theta)
                    )
                }
                p5.endShape(p5.CLOSE)
            }
        }
        p5.pop()
    }
    p5.windowResized = () => {
        const canvasReSize = sketchSize()
        p5.resizeCanvas(canvasReSize.w, canvasReSize.h)
    }
}
export default patternBuildingLoop
