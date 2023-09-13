import Layer from './Layer'
import { createNoise3D } from 'simplex-noise'

const recording = false
const numFrame = 100
const numLayer = 100
const noiseThreshold = 0.3
const gifOptions = {
    quality: 10,
    render: true,
    download: true,
    fileName: 'noiseGrid.gif'
}
const noise3D = createNoise3D()

const sketch = (p5) => {
    // Layer need these two functions
    window.noise = noise3D
    //window.noise = p5.noise
    let size, cols, rows, layers, depthStep, hSize, sketchDim, canvas
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
        size = 75
        sketchDim = sketchSize()
        cols = p5.floor(sketchDim.w / size)
        rows = p5.floor(sketchDim.h / size)
        depthStep = sketchDim.h / (numLayer * numFrame)
        hSize = (sketchDim.h * 1.5) / numLayer
        layers = []
        for (let n = 0; n < numLayer; n++) {
            layers.push(new Layer(cols, rows, n, n / numLayer))
        }
    }

    p5.setup = () => {
        sketch.init()
        canvas = p5.createCanvas(sketchDim.w, sketchDim.h, p5.WEBGL)
        canvas.elt.style.aspectRatio = `${sketchDim.w} / ${sketchDim.h}`
        p5.setAttributes('antialias', true)
        p5.strokeWeight(2)
        p5.smooth(10)
        p5.fill(15)

        if (recording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: 2.5,
                framesPerSecond: 24
            })
        }
    }

    p5.draw = () => {
        p5.background(15)
        p5.push()
        p5.translate(-p5.width * 0.5, p5.height * 0.8 + depthStep, -p5.height)
        p5.rotateX(p5.PI * 0.5)

        for (let i = 0; i < layers.length; i++) {
            const frameIndex = p5.frameCount * 0.1
            if (layers[i].depth >= numLayer) {
                layers[i] = new Layer(cols, rows, 1, i, frameIndex)
            } else {
                layers[i].computePoints(numLayer, frameIndex)
            }

            const z = layers[i].depth * hSize
            const lines = layers[i].getLines(noiseThreshold, size)
            if (i == layers.length - 1) {
                p5.stroke(53, 138, 53)
            } else {
                p5.stroke(50 + 205 * (layers[i].depth / numLayer))
            }
            if (layers[i].depth < numLayer) {
                p5.beginShape()
                for (let j = 0; j < lines.length; j++) {
                    p5.vertex(lines[j].x1, lines[j].y1, z)
                    p5.vertex(lines[j].x2, lines[j].y2, z)
                }
                p5.endShape(p5.CLOSE)
            }
            layers[i].depth++
        }

        p5.pop()
    }

    sketch.exportJPG = () => {
        p5.saveFrames('capture', 'jpg', 1, 1)
    }
}
export default sketch
