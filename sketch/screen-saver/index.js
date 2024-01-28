import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const palette = ['#fff', '#555']
const sketch = (p5) => {
    let rectSize, canvas
    const numFrame = 240
    const res = 1.5
    const scale = 2 + Math.random() * 1.5

    p5.setup = () => {
        canvas = p5.createCanvas(1200, 1200)
        canvas.elt.style.aspectRatio = `1 / 1`
        p5.rectMode(p5.CENTER)
        p5.noStroke()
        rectSize = Math.max(p5.width, p5.height) * res * 0.5
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame
        const s = Math.PI * (t+1)
        p5.background(palette[0])
        p5.push()
        p5.drawingContext.globalCompositeOperation = 'xor'
        p5.translate(p5.width * 0.5, p5.height * 0.5)

        for (let i = -s; i <= s; i += res) {
            for (let j = -s; j <= s; j += res) {
                const k = {
                    x: Math.cos(i) / Math.atan(j - i),
                    y: Math.atan(j) * Math.cos(i)
                }
                const l = { x: Math.sin(k.x), y: Math.sin(k.y) }
                const m = { x: l.x * p5.width, y: l.y * p5.height }
                const r = {
                    w: rectSize * Math.abs(0.5 - Math.cos(i)),
                    h: rectSize * Math.abs(0.5 - Math.cos(i))
                }
                p5.fill(palette[1])
                p5.rect(m.x, m.y, r.w * scale, r.h * scale)
            }
        }

        p5.pop()
        // if (p5.frameCount >= numFrame - 1 && record) recorder.stop()
    }
    sketch.exportJPG = () => {
        p5.save(canvas, 'capture', 'jpg')
    }
}

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.infobox = infobox
window.exportJPG = sketch.exportJPG
handleAction()
