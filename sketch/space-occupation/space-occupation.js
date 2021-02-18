import ease from '../../src/js/sketch-common/ease'
import Pool from '../../src/js/sketch-common/Pool'

const sketch = (p5) => {
    const frameRange = { min: 60, max: 120 }
    const easeRange = { min: 1, max: 4 }
    const N = 6
    const margin = 0.05
    let cols, nextCols, rows, nextRows
    const xPool = new Pool(N)
    let yPool = []
    for (let i = 0; i < N; i++) {
        yPool.push(new Pool(N))
    }
    let numFrame = Math.round(p5.random(frameRange.min, frameRange.max))
    let easeValue = p5.random(easeRange.min, easeRange.max)
    const next = () => {
        xPool.update()
        const newCols = xPool.getItems()
        let newRows = []
        for (let i = 0; i < N; i++) {
            yPool[i].update()
            newRows.push(yPool[i].getItems())
        }

        return [newCols, newRows]
    }
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    sketch.init = () => {
        ;[cols, rows] = next()
        ;[nextCols, nextRows] = next()
    }
    p5.setup = () => {
        const size = sketchSize()
        p5.createCanvas(size.w, size.h)
        p5.fill(255)
        p5.ellipseMode(p5.CORNERS)
        p5.noStroke()
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            p5.background(0)

            const t = ease((p5.frameCount % numFrame) / numFrame, easeValue)
            let dx = p5.width * margin
            for (let i = 0; i < N; i++) {
                const x =
                    p5.lerp(cols[i], nextCols[i], t) * p5.width * (0.5 - margin)
                let dy = p5.height * margin
                for (let j = 0; j < N; j++) {
                    const y =
                        p5.lerp(rows[i][j], nextRows[i][j], t) *
                        p5.height *
                        (0.5 - margin)
                    p5.ellipse(dx, dy, dx + x, dy + y)
                    p5.ellipse(p5.width - dx, dy, p5.width - (x + dx), y + dy)
                    p5.ellipse(dx, p5.height - dy, dx + x, p5.height - (dy + y))
                    p5.ellipse(
                        p5.width - dx,
                        p5.height - dy,
                        p5.width - (dx + x),
                        p5.height - (dy + y)
                    )

                    dy += y
                }
                dx += x
            }
        } else {
            cols = nextCols
            rows = nextRows
            ;[nextCols, nextRows] = next()
            numFrame = Math.round(p5.random(frameRange.min, frameRange.max))
            easeValue = p5.random(easeRange.min, easeRange.max)
        }
    }

    p5.windowResized = () => {
        const size = sketchSize()
        p5.resizeCanvas(size.w, size.h)
    }
}
export default sketch
