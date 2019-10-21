import p5 from "p5"
import style from '../src/sass/project.scss'

const containerElement = document.body
const loader = document.getElementById('p5_loading')

////////////////////////////////////////////////////////////

import colourscafe from '../tools/chromotome/palettes/colourscafe'

const pallette_id = Math.floor(Math.random() * 7)
const pallette = colourscafe[pallette_id].colors


const sketch = (p5) => {

    const numFrame = 512
    const circleMargin = 12
    const arcWidth = 32
    const arcPerCircle = 5
    const circleNum = (window.innerHeight / (circleMargin + arcWidth)) / 2
    const angleStep = p5.TWO_PI / arcPerCircle
    const center = {
        "x": window.innerWidth / 2,
        "y": window.innerHeight / 2
    }

    p5.setup = () => {

        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.noFill()
    }
    p5.draw = () => {

        p5.background(colourscafe[pallette_id].background)

        let t = 1 * (
            p5.frameCount < numFrame ?
            p5.frameCount / numFrame :
            (p5.frameCount % numFrame) / numFrame
        )

        let _a = p5.TWO_PI * t;
        let _b = (1 - t) * p5.TWO_PI

        for (let r = 0; r < circleNum; r++) {

            p5.strokeWeight(r * 2)
            const rot = r % 2 == 0 ? _a : _b

            for (let a = 0; a < arcPerCircle; a++) {

                const color_id = r + a < pallette.length ? r + a : (r + a) % pallette.length
                const radius = r * arcWidth;
                const position = {
                    "x": center.x + radius * p5.cos(r + _a),
                    "y": center.y + radius * p5.sin(r + _b),
                }
                let strokeColor = p5.color(pallette[color_id])
                strokeColor.setAlpha(75)
                p5.stroke(strokeColor)
                p5.beginShape()
                for (let a = 0; a <= arcPerCircle; a++) {
                    p5.vertex(
                        position.x + radius * p5.cos((a * angleStep) + rot),
                        position.y + radius * p5.sin((a * angleStep) + rot)
                    )
                }
                p5.endShape(p5.CLOSE)
            }
        }
    }
}

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)