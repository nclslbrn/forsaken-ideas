'use strict'
import Layer from './Layer'
import { makeNoise3D } from 'open-simplex-noise'

const recording = false
const numFrame = 360
const numLayer = 80
const noiseThreshold = 0.45
const gifOptions = {
    quality: 10,
    render: true,
    download: true,
    fileName: 'noiseGrid.gif'
}
const noise3D = makeNoise3D(Date.now())

const sketch = (p5) => {
    // Layer need these two functions
    //window.noise = p5.noise
    window.noise = noise3D
    let size, cols, rows, layers, depthStep, hSize, sketchDim
    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    /**
     * Initialize sketch constants and build the
     * grid with noise value
     */
    sketch.init = () => {
        size = 16 * p5.floor(p5.random(4, 8))
        sketchDim = sketchSize()
        cols = p5.floor(sketchDim.w / size)
        rows = p5.floor(sketchDim.h / size)
        depthStep = sketchDim.h / (numLayer * numFrame)
        hSize = sketchDim.h / numLayer
        layers = []
        for (let n = 0; n < numLayer; n++) {
            layers.push(new Layer(cols, rows, n, n / numLayer))
        }
    }

    p5.setup = () => {
        init()
        p5.createCanvas(sketchDim.w, sketchDim.h, p5.WEBGL)
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
        // const tt = (t < 0.5 ? t : 1 - t) * 2
        p5.background(15)
        p5.push()
        p5.translate(
            -p5.width * 0.5,
            p5.height * 0.5 - depthStep,
            -p5.height * 0.5
        )
        // p5.rotateX(p5.QUARTER_PI)
        p5.rotateX(p5.HALF_PI)

        for (let i = 0; i < layers.length; i++) {
            layers[i].depth++
            if (layers[i].depth >= numLayer) {
                layers[i] = new Layer(cols, rows, 1, i)
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
        p5.resizeCanvas(sketchDim.w, sketchDim.h)
    }
}
export default sketch
