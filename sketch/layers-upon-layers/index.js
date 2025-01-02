import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { canvasRecorder } from '@thi.ng/dl-asset'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas,
    shader,
    animated = false,
    recorder = null,
    recording = false,
    traits = { numLayers: null, noiseSize: null }

const dpr = Math.ceil(window.devicePixelRatio) || 1

const sketch = (p5) => {
    p5.preload = () => {
        shader = p5.loadShader('assets/shader.vert', 'assets/shader.frag')
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
        p5.pixelDensity(dpr)
    }

    p5.draw = () => {
        p5.blendMode()
        p5.shader(shader)
        shader.setUniform('u_resolution', [p5.width * dpr, p5.height * dpr])
        shader.setUniform('u_time', p5.frameCount)
        shader.setUniform('u_noiseSize', traits.noiseSize)
        p5.rect(0, 0, p5.width, p5.height)

        //p5.rect(-p5.width / 2, -p5.height / 2, p5.width, p5.height)
    }

    sketch.init = () => {
        traits.noiseSize = 2.0 + p5.random() * 6.0
        p5.redraw()
    }

    sketch.capture = () => p5.saveCanvas(canvas, 'layers-upon-layers.jpg')

    sketch.play = () => {
        if (animated) {
            p5.noLoop()
        } else {
            p5.loop()
            p5.redraw()
        }
        animated = !animated
    }
}

window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'r') {
        recording = !recording
        console.log('recording', recording)
        if (recording) {
            recorder = canvasRecorder(canvas.elt, 'layers-upon-layers', {
                mimeType: 'video/webm;codecs=vp9',
                fps: 60
            })
            recorder.start()
            console.log(
                '%c Record started ',
                'background: tomato; color: white'
            )
        } else {
            recorder.stop()
            console.log(
                '%c Record stopped ',
                'background: limegreen; color: black'
            )
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
