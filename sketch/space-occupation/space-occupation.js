import ease from '../../src/js/sketch-common/ease'

const sketch = (p5) => {
    const interval = { min: 4, max: 64 }
    const numFrame = 60
    const numRow = 6
    let cols, nextCols, heights, nextHeights

    const randomNumber = () => {
        return Math.floor(
            Math.random() * (interval.max - interval.min + 1) + interval.min
        )
    }
    const next = () => {
        const newCols = []
        const newHeights = []
        for (let i = 0; i < numRow; i++) {
            newCols.push(randomNumber())
            newHeights.push(randomNumber())
        }
        const sumH = newHeights.reduce((sum, h) => sum + h)
        const hFactor = sumH / p5.height
        const resizedHeights = newHeights.map((height) => height / hFactor)

        return [newCols, resizedHeights]
    }
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    sketch.init = () => {
        ;[cols, heights] = next()
        ;[nextCols, nextHeights] = next()
    }
    p5.setup = () => {
        const size = sketchSize()
        p5.createCanvas(size.w, size.h)
        p5.fill(255)
        p5.noStroke()
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            p5.background(0)

            const t = (p5.frameCount % numFrame) / numFrame
            let y = 0
            for (let i = 0; i < numRow; i++) {
                const height = Math.round(
                    p5.lerp(heights[i], nextHeights[i], ease(t))
                )
                const tCols = Math.round(p5.lerp(cols[i], nextCols[i], ease(t)))

                for (let x = 0; x < tCols; x++) {
                    const l = p5.map(x, 0, tCols, -0.5, 2)
                    const width = Math.asin(l) * (p5.width / tCols)

                    p5.ellipse(
                        x * width + width / 2,
                        y + height / 2,
                        width,
                        height
                    )
                }
                y += height
            }
        } else {
            cols = nextCols
            heights = nextHeights
            ;[nextCols, nextHeights] = next()
        }
    }

    p5.windowResized = () => {
        const size = sketchSize()
        p5.resizeCanvas(size.w, size.h)
    }
}
export default sketch
