import p5 from 'p5'

const sketch = (p5) => {
    const pointsByLayer = 24
    let layers = []
    let newLayers = []
    let sizes = []
    let newSizes = []
    let shader
    const numFrame = 30

    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }

    const getNewLayers = () => {
        const nextLayers = [...layers]
        const layersBackup = [...layers]

        const nextSize = [...sizes]
        const sizeBackup = [...sizes]

        const a = p5.floor(p5.random() * pointsByLayer)
        const b = p5.floor(p5.random() * pointsByLayer)

        nextLayers[a] = layersBackup[b]
        nextLayers[b] = layersBackup[a]

        nextSize[a] = sizeBackup[b]
        nextSize[b] = sizeBackup[a]

        return [nextLayers, nextSize]
    }

    sketch.init = () => {
        layers = []
        for (let j = 0; j < pointsByLayer; j++) {
            layers.push({
                x: p5.round(p5.width * p5.random(-0.5, 0.5)),
                y: p5.round(p5.height * p5.random(-0.5, 0.5)),
                z: p5.round(p5.height * p5.random(-0.5, 0.5))
            })
            sizes.push(p5.round(p5.random(16, 88)))
        }
        ;[newLayers, newSizes] = getNewLayers()
    }

    p5.preload = () => {
        shader = p5.loadShader('./assets/shader.vert', './assets/shader.frag')
    }

    p5.setup = () => {
        const size = sketchSize()
        p5.createCanvas(size.w, size.h, p5.WEBGL)
        p5.stroke(255)
        p5.noStroke()
        p5.fill(255)
        sketch.init()
    }

    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame

            p5.background(0)
            p5.ambientLight(50)
            p5.pointLight(255, 150, 150, -p5.width / 2, -p5.height / 2, 0)
            p5.pointLight(150, 150, 255, p5.width / 2, p5.height / 2, 0)
            //p5.shader(shader)

            p5.push()
            p5.rotateX(p5.QUARTER_PI)
            p5.rotateZ(p5.QUARTER_PI)
            p5.translate(-p5.width / 2, -p5.height / 2, -p5.height / 2)

            for (let j = 0; j < pointsByLayer; j++) {
                const x = p5.lerp(layers[j].x, newLayers[j].x, t)
                const y = p5.lerp(layers[j].y, newLayers[j].y, t)
                const z = p5.lerp(layers[j].z, newLayers[j].z, t)
                const size = p5.lerp(sizes[j], newSizes[j], t)

                p5.push()
                p5.translate(x, y, z)

                p5.rect(size * -0.5, size * -0.5, size, size)

                p5.push()
                p5.rotateX(p5.HALF_PI)
                p5.translate(0, 0, size * -0.5)
                p5.rect(size * -0.5, -size, size, size)
                p5.pop()

                p5.push()
                p5.rotateX(p5.HALF_PI)
                p5.translate(0, 0, size * 0.5)
                p5.rect(size * -0.5, -size, size, size)
                p5.pop()

                p5.pop()
            }
            p5.pop()
        } else {
            ;[newLayers, newSizes] = getNewLayers()
        }
    }

    p5.mousePressed = () => {}

    p5.windowResized = () => {
        const size = sketchSize()
        p5.resizeCanvas(size.w, size.h, p5.WEBGL)
    }
}
export default sketch
