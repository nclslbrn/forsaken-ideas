import ease from '../../sketch-common/ease'
import Pool from '../../sketch-common/Pool'
let canvasElem

const sketch = (p5) => {
    const N = 16
    const margin = 0.07
    let cols, nextCols, rows, nextRows
    const xPool = new Pool(N)
    let yPool = []
    for (let i = 0; i < N; i++) {
        yPool.push(new Pool(N))
    }
    const numFrame = 60
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
        return side > 960 ? 960 : side * 0.85
    }
    sketch.init = () => {
        ;[cols, rows] = next()
        ;[nextCols, nextRows] = next()
    }
    p5.setup = () => {
        const size = sketchSize()
        canvasElem = p5.createCanvas(size, size)
        canvasElem.elt.style.aspectRatio = '1 / 1'
        p5.fill(255)
        p5.ellipseMode(p5.CORNERS)
        p5.noStroke()
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            p5.background(0)

            const t = ease((p5.frameCount % numFrame) / numFrame, 5)
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
        }
    }
}
export default sketch
