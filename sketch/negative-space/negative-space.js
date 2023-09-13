const colors = [
    [249, 234, 231],
    [25, 27, 32]
]
let canvas

const sketch = (p5) => {
    sketch.init = () => {
        const margin = p5.width * 0.04
        const step = Math.ceil(Math.random() * 5) * 20
        p5.shuffle(colors, true)
        p5.background(...colors[0])
        p5.stroke(...colors[1])

        for (let i = margin; i < p5.width - margin; i++) {
            for (let j = margin; j < p5.height - margin * 1.5; j += step) {
                const n1 = p5.noise((i / p5.height) * step)
                const n2 = p5.noise((j / p5.height) * step)
                sketch.sandLine(
                    { x: i, y: j + n1 * step },
                    { x: i, y: j + n2 * step }
                )
            }
        }
    }
    sketch.sandLine = (from, to) => {
        const threshold = 0.9
        const step = 1
        const angle = Math.atan2(to.y - from.y, to.x - from.x)
        const size = Math.sqrt(
            Math.abs(to.x - from.x) ** 2 + Math.abs(to.y - from.y) ** 2
        )
        p5.strokeWeight(step)

        for (let r = 0; r <= size; r += step) {
            if (Math.random() < threshold) {
                p5.point(
                    from.x + Math.cos(angle) * r,
                    from.y + Math.sin(angle) * r
                )
            }
        }
    }
    p5.setup = () => {
        canvas = p5.createCanvas(1000, 1000)
        canvas.elt.style.aspectRatio = `1 / 1`
        sketch.init()
    }
    p5.draw = () => {}
}

export default sketch
