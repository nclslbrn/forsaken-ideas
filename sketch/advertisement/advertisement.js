import { SingleEntryPlugin } from 'webpack'
import words from '../../src/json/e-m-g-words.json'
const eWords = words.e

const sketch = (p5) => {
    const numFrame = 90
    let font, word, points, bounds

    sketch.init = () => {
        word = eWords[p5.floor(p5.random() * eWords.length)]
        word.toUpperCase()
        console.log(word)
        /* points = font.textToPoint(word, 0, 0, 10, {
            sampleFactor: 5,
            simplifyThreshold: 0
        })
        bounds = font.textBounds(' ' + word + ' ', 0, 0, 10) */
    }
    p5.preload = () => {
        //font = loadFont('data/Inter-Bold.otf')
    }
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(255)
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            /* p5.background(255)
            p5.beginShape()
            p5.translate(
                (-bounds.x * p5.width) / bounds.w,
                (-bounds.y * p5.height) / bounds.h
            )
            for (let i = 0; i < points.length; i++) {
                p5.vertex(
                    (points[i].x * p5.width) / bounds.w,
                    (points[i].y * p5.height) / bounds.h
                )
            } */
        } else {
            sketch.init()
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
