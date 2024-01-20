import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas
const colors = ['#f3f3f3', '#fdcf5f', '#4887e7', '#f5646d', '#333333']
const sketch = (p5) => {
    sketch.init = () => {
        const mrg = p5.random(24, 48),
            len = p5.width - mrg * 2,
            div = Math.round(p5.random(2, 4)),
            cel = len / div,
            cen = [
                [0, 0],
                [cel, 0],
                [cel, cel],
                [0, cel],
                [cel / 2, cel / 2],
                [0, cel / 2],
                [0, 0],
                [cel / 2, 0]
            ]
        p5.noStroke()
        p5.background('white')
        p5.strokeWeight(cel / 8)
        p5.strokeCap(p5.SQUARE)

        for (let a = 0; a < div; a++) {
            for (let b = 0; b < div; b++) {
                const x = mrg + a * cel,
                    y = mrg + b * cel
                p5.drawingContext.save()
                p5.fill(colors[(a * div + b) % colors.length])
                p5.rect(x, y, cel, cel)
                p5.drawingContext.clip()
                p5.push()

                for (let c = 0; c < 4; c++) {
                    p5.noFill()

                    const p = Math.floor(Math.random() * 8)
                    const r = (Math.PI / 2) * (p % 4)

                    for (let d = 0.5; d < 3; d += 0.5) {
                        const s = p5.map(d, 3, 0, cel / 2, cel * 2)

                        p5.stroke(colors[(c + ((d * 2) % 2)) % colors.length])
                        p5.arc(
                            x + cen[p][0],
                            y + cen[p][1],
                            s,
                            s,
                            r,
                            r + p5.PI * 0.5
                        )
                    }
                }
                p5.pop()
                p5.drawingContext.restore()
            }
        }
    }

    p5.setup = () => {
        canvas = p5.createCanvas(1200, 1200)
        sketch.init()
    }

    sketch.capture = () => p5.saveCanvas(canvas, 'Bauhaus.jpg')

    p5.moussePressed = () => {
        p5.saveCanvas()
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.infobox = infobox
handleAction()
