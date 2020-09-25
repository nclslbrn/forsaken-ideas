'use strict'
import Layer from './Layer'
import { makeNoise3D } from 'open-simplex-noise'

const recording = true
const numFrame = 60
const numLayer = 100
const noiseThreshold = 0.35
const gifOptions = {
    quality: 10,
    render: false,
    download: true,
    fileName: 'noiseGrid.gif'
}
const noise3D = makeNoise3D(Date.now())

const sketch = (p5) => {
    // Layer need these two functions
    //window.noise = p5.noise
    window.noise = noise3D
    let noise, size, cols, rows, layers, depthStep, hSize, width, height

    /**
     * Initialize sketch constants and build the
     * grid with noise value
     */
    sketch.init = () => {
        size = 8 * p5.floor(p5.random(4, 8))
        width = 800
        height = 800
        cols = p5.floor(width / size)
        rows = p5.floor(height / size)
        depthStep = height / (numLayer * numFrame)
        hSize = height / numLayer
        layers = []
        for (let n = 0; n < numLayer; n++) {
            layers.push(new Layer(cols, rows, n, n / numLayer))
        }
    }

    p5.setup = () => {
        init()
        p5.createCanvas(width, height, p5.WEBGL)
        p5.stroke(125)
        p5.noFill()
        p5.smooth()

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
        const tt = (t < 0.5 ? t : 1 - t) * 2
        p5.background(15)
        p5.push()
        p5.translate(
            -p5.width * 0.5,
            p5.height * 0.5 - depthStep,
            -p5.height * 0.5
        )
        //p5.rotateX(p5.QUARTER_PI)
        p5.rotateX(p5.HALF_PI)

        for (let i = 0; i < layers.length; i++) {
            layers[i].depth++
            if (layers[i].depth >= numLayer) {
                layers[i] = new Layer(cols, rows, 1, t + i)
            } else {
                layers[i].computePoints(t + i)
            }

            const z = layers[i].depth * hSize
            const lines = layers[i].getLines(noiseThreshold, size)
            for (let j = 0; j < lines.length; j++) {
                p5.line(
                    lines[j].x1,
                    lines[j].y1,
                    z,
                    lines[j].x2,
                    lines[j].y2,
                    z
                )
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
