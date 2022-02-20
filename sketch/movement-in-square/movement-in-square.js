const sketch = (p5) => {
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return [side > 800 ? 800 : side * 0.85, side > 800 ? 800 : side * 0.85]
    }
    const cols = 31
    const rows = 12
    const colors = [40, 245]

    sketch.init = () => {
        p5.background(colors[1])
        const cellH = p5.height / rows
        let dx = 0
        let cellW = cellH

        for (let x = 0; x <= cols; x++) {
            if (x > 3) {
                if (x + 1 <= cols / 2) {
                    cellW *= 0.8
                } else {
                    cellW *= 1.115
                }
            }
            for (let y = 0; y < rows; y++) {
                if (
                    (x % 2 === 0 && y % 2 !== 0) ||
                    (x % 2 !== 0 && y % 2 == 0)
                ) {
                    p5.fill(colors[0])
                } else {
                    p5.fill(colors[1])
                }

                p5.rect(dx, y * cellH, cellW, cellH)
            }
            dx += cellW
        }
    }
    p5.setup = () => {
        p5.createCanvas(...sketchSize())
        p5.noStroke()
        sketch.init()
    }
    p5.windowResized = () => {
        p5.resizeCanvas(...sketchSize())
        sketch.init()
    }
}
export default sketch
