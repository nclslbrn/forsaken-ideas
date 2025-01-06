import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    dpr = Math.round(window.devicePixelRatio) || 1,
    primaries = [
        [0.8, 0.8, 0.8],
        [0.91, 0.7, 0.19],
        [0.28, 0.53, 0.91],
        [0.96, 0.39, 0.43],
        [0.22, 0.86, 0.43],
        [0.29, 0, 0.89]
    ]

let traits = {
        noiseSize: 0,
        lightColor: null,
        lightDirection: null,
        ambiantColor: null
    },
    isAnimated = false,
    canvas,
    shader

const sketch = (p5) => {
    p5.preload = () => {
        shader = p5.loadShader(
            'assets/primitive-shapes-landscape.vert',
            'assets/primitive-shapes-landscape.frag'
        )
    }

    p5.setup = () => {
        canvas = p5.createCanvas(
            window.innerWidth,
            window.innerHeight,
            p5.WEBGL
        )
        sketch.init()
        p5.noStroke()
        p5.noLoop()
    }

    p5.draw = () => {
        p5.blendMode()
        p5.shader(shader)
        shader.setUniform('u_resolution', [p5.width * dpr, p5.height * dpr])
        shader.setUniform('u_mouse', [
            p5.mouseX / p5.width,
            p5.mouseY / p5.height
        ])
        shader.setUniform('u_time', p5.frameCount * 0.001)
        shader.setUniform('u_noiseSize', traits.noiseSize)
        shader.setUniform('u_lightDir', traits.lightDirection)
        shader.setUniform('u_lightColor', traits.lightColor)
        shader.setUniform('u_ambientColor', traits.ambiantColor)
        p5.rect(-p5.width / 2, -p5.height / 2, p5.width, p5.height)
    }

    sketch.capture = () =>
        p5.saveCanvas(canvas, 'primitive-shapes-landscape.jpg')

    sketch.init = () => {
        traits.noiseSize = 1 + p5.random(0.5, 2.5)
        traits.lightDirection = [
            0.5 + p5.random() / 2,
            0.5 + p5.random() / 2,
            0.5 + p5.random() / 2
        ]
        traits.ambiantColor = [0.2, 0.15, 0.25]
        traits.lightColor = p5.random(primaries)
        p5.redraw()
    }

    sketch.play = () => {
        isAnimated = !isAnimated
        if (isAnimated) {
            p5.loop()
            p5.redraw()
        } else {
            p5.noLoop()
        }
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.play = sketch.play
window.infobox = infobox
handleAction()
