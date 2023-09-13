'use strict'
// import ease from '../../sketch-common/ease'
import Layer from './Layer'
import { makeNoise3D } from 'simplex-noise'

const recording = true
const numFrame = 60
const numLayer = 15
const noiseThreshold = 0.35
const gifOptions = {
    quality: 10,
    render: false,
    download: true,
    fileName: 'noiseGrid.gif'
}

const sketch = (p5) => {
    // Layer need these two functions
    window.noise = makeNoise3D()
    let noise, size, hSize, cols, rows, layers, width, height

    /**
     * Initialize sketch constants and build the
     * grid with noise value
     */
    sketch.init = () => {
        size = p5.floor(p5.random(6, 8)) * 12
        width = 800
        height = 800
        hSize = height / numLayer
        cols = p5.floor(width / size)
        rows = p5.floor(height / size)
        layers = []
        for (let n = 0; n < numLayer; n++) {
            layers.push(new Layer(cols, rows, n + 1, n / numLayer))
        }
    }

    p5.setup = () => {
        init()
        p5.createCanvas(width, height, p5.WEBGL)
        p5.fill(200)

        if (recording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: 2.5,
                framesPerSecond: 24
            })
        }
    }

    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t < 0.5 ? t : 1 - t * 2
        p5.background(25)
        p5.ambientLight(220)
        p5.directionalLight(255, 120, 120, -width / 2, height / 2, -height / 2)
        p5.pointLight(120, 120, 255, width / 2, height / 2, height / 2)

        p5.push()
        p5.translate(
            -p5.width * 0.5,
            height * 0.25 + t * hSize,
            -p5.height * 0.5
        )
        // p5.rotateX(p5.QUARTER_PI)
        p5.rotateX(p5.HALF_PI)

        for (let i = 0; i < layers.length; i++) {
            layers[i].depth++
            if (layers[i].depth >= numLayer) {
                layers[i] = new Layer(cols, rows, 1, t + i)
            }
            layers[i].computePoints(t + i)
            const z = layers[i].depth * hSize
            const lines = layers[i].getLines(noiseThreshold, size)

            for (let j = 0; j < lines.length; j++) {
                p5.beginShape()
                p5.vertex(lines[j].x1, lines[j].y1, z)
                p5.vertex(lines[j].x1, lines[j].y1, z + hSize)
                p5.vertex(lines[j].x2, lines[j].y2, z + hSize)
                p5.vertex(lines[j].x2, lines[j].y2, z)
                p5.endShape(p5.CLOSE)
            }
        }

        p5.pop()
    }

    p5.windowResized = () => {
        init()
        p5.resizeCanvas(cols * size, rows * size)
    }
}
export default sketch
