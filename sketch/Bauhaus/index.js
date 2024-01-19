import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas
const colors = ['#fefefe', '#fdcf5f', '#4887e7', '#f5646d', '#222222']
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

        for (let a = 0; a < div; a++) {
            for (let b = 0; b < div; b++) {
                const x = mrg + a * cel,
                    y = mrg + b * cel

                p5.fill(colors[(a * div + b) % colors.length])
                p5.rect(x, y, cel, cel)

                for (let c = 0; c < 4; c++) {
                    const p = Math.floor(
                        Math.random() * (a < 1 || b < 1 ? 4 : 8)
                    )
                    const r = (Math.PI / 2) * (p % 4)

                    for (let d = 1; d < 3; d++) {
                        const s = cel / d

                        p5.fill(colors[(c + (d % 2)) % colors.length])
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
