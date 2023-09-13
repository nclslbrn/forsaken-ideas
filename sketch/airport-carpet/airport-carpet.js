import getPalette from './palette'
import Range from './Range'
import sandLine from './sandLine'

let canvas
const size = [1200, 1080]
const sketch = (p5) => {
    sketch.init = () => {
        const yRange = new Range(8)
        const palette = getPalette(-1)
        const margin = p5.width * 0.04
        const inner = [
            p5.width - margin * 2,
            p5.height - margin * 2
        ]
        let dy = margin
        p5.shuffle(palette, true)
        p5.background(245)

        for (let i = 0; i < yRange.items.length; i++) {
            const xRange = new Range(5)
            const y = yRange.items[i] * inner[1]
            let dx = margin

            for (let j = 0; j < xRange.items.length; j++) {
                const x = xRange.items[j] * inner[0]
                p5.noStroke()
                p5.fill(p5.random(palette))
                p5.rect(dx, dy, x, y)
                const randColor = p5.random(palette)
                const step = p5.random([2, 3, 4, 5])
                p5.strokeWeight(step / 2)
                for (let _y = 0; _y <= y; _y += step) {
                    sandLine(
                        { x: dx, y: dy + _y },
                        { x: dx + x, y: dy + _y },
                        randColor,
                        p5
                    )
                }

                dx += x
            }
            dy += y
        }
    }
    p5.setup = () => {
        canvas = p5.createCanvas(...size)
        canvas.elt.style.aspectRatio = `${size[0]} / ${size[1]}`
        
        sketch.init()
    }
    p5.draw = () => { }
    sketch.export = () => {
        const date = new Date()
        const filename =
            'airport-carpet.' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
        p5.save(canvas, filename, 'png')
    }
}
export default sketch
