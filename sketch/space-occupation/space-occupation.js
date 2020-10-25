import * as p5 from 'p5'

const sketch = (p5) => {
    const interval = { min: 4, max: 84 }
    const numFrame = 30
    let rows, cols, nextRows, nextCols
    const randomNumber = () => {
        return Math.floor(
            Math.random() * (interval.max - interval.min + 1) + interval.min
        )
    }
    const next = () => {
        const newRows = randomNumber()
        const newCols = []
        for (let i = 0; i < newRows; i++) {
            newCols.push(randomNumber())
        }
        return [newRows, newCols]
    }
    sketch.init = () => {
        rows = randomNumber()
        cols = []
        for (let i = 0; i < rows; i++) {
            cols.push(randomNumber())
        }
    }
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.fill(255)
        sketch.init()
        ;[nextRows, nextCols] = next()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            p5.background(0)

            const t = (p5.frameCount % numFrame) / numFrame
            const tRows = Math.round(p5.lerp(rows, nextRows, t))
            const height = p5.height / tRows

            for (let y = 0; y < tRows; y++) {
                const tCols = Math.round(p5.lerp(cols[y], nextCols[y], t))
                const width = p5.width / tCols
                for (let x = 0; x < tCols; x++) {
                    p5.ellipse(x * width, y * height, width, height)
                }
            }
        } else {
            cols = nextCols
            rows = nextRows
            ;[nextRows, nextCols] = next()
        }
    }

    function windowResized() {
        resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
