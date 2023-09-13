import { generateHslaColors } from '../../sketch-common/generateHslaColors'

const sketch = (p5) => {
    
    let colors 
    
    const sketchDim = 1200, 
        center = 600,
        numFrame = 120

    const init = () => {
        colors = generateHslaColors(75, 60, 255, 2).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
        p5.fill(colors[1])
    }
    p5.setup = () => {
        init()
        let canvas = p5.createCanvas(sketchDim, sketchDim)
        canvas.elt.style.aspectRatio = '1 / 1'

        p5.frameRate(24)
        p5.blendMode(p5.SUBTRACT)
        p5.colorMode(p5.HSLA, 360, 100, 100, 100)
        p5.noStroke()
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const t1 = t > 0.5 ? t : 1 - t
        const t2 = p5.map(t1, 0, 1, 4, 8)

        p5.background(colors[0])
        p5.beginShape()
        for (let theta = 0; theta < Math.PI * 2; theta += 0.001) {
            const x =
                center +
                Math.cos(theta) * Math.cos(theta * t2) * (sketchDim / 3)

            const y =
                center +
                Math.sin(theta) * Math.sin(theta * t2) * (sketchDim / 3)

            p5.vertex(x, y)
        }
        p5.endShape()
    }
    
    sketch.init = init
}
export default sketch
