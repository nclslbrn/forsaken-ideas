'use strict'
// import ease from '../../src/js/sketch-common/ease'
import Layer from './Layer'
import { makeNoise3D } from 'open-simplex-noise'

const recording = false
const numFrame = 60
const numLayer = 30
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
    window.line = p5.line
    window.noise = noise3D
    let noise, size, cols, rows, layers, depthStep, width, height

    /**
     * Initialize sketch constants and build the
     * grid with noise value
     */
    sketch.init = () => {
        size = p5.floor(p5.random(6, 8)) * 8
        width = 800
        height = 800
        cols = p5.floor(width / size)
        rows = p5.floor(height / size)
        depthStep = (3 * height * numFrame) / (numLayer * size)
        layers = []
        for (let n = 0; n < numLayer; n++) {
            layers.push(new Layer(cols, rows, n * depthStep))
        }
    }

    p5.setup = () => {
        init()
        p5.createCanvas(width, height, p5.WEBGL)
        /*         
        p5.lights()
        p5.ambientLight(50)
        p5.directionalLight(255, 0, 0, -width / 2, height / 2, -height / 2)
        p5.pointLight(0, 0, 255, width / 2, height / 2, height / 2)
        */
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
        p5.push()
        p5.translate(
            -p5.width * 0.5,
            p5.height * 0.5 + depthStep * t,
            -p5.height * 0.5
        )
        // p5.rotateX(p5.QUARTER_PI)
        p5.rotateX(p5.HALF_PI)

        for (let i = 0; i < layers.length; i++) {
            layers[i].depth += depthStep
            if (layers[i].depth >= height * 3) {
                layers[i] = new Layer(cols, rows, 0)
            }
            layers[i].computePoints(layers[i].depth)
            const z = layers[i].depth
            const lines = layers[i].getLines(noiseThreshold, size)

            p5.fill(50 + (layers[i].depth / height) * 200)
            for (let j = 0; j < lines.length; j++) {
                p5.beginShape()
                p5.vertex(lines[j].x1, lines[j].y1, z)
                p5.vertex(lines[j].x1, lines[j].y1, z + depthStep)
                p5.vertex(lines[j].x2, lines[j].y2, z + depthStep)
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
