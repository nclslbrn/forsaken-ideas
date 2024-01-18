import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
import { getPalette } from '@nclslbrn/artistry-swatch'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const { PI, sin, cos, random, floor } = Math
let canvas, palette

const sketch = (p5) => {
    // pointy top hex
    const hex = (x, y, r, s, f = false) => {
        const ps = []
        p5.fill(palette.background)
        p5.beginShape()
        for (let l = PI * 0.5; l <= PI * 2.5; l += PI / 3) {
            const p = [x + r * cos(l), y + r * sin(l)]
            ps.push(p)
            p5.vertex(...p)
        }
        p5.endShape()

        if (f) {
            p5.fill(p5.random(palette.colors))
            p5.beginShape()
            p5.vertex(x, y)
            for (let i = 0; i < s; i++) {
                p5.vertex(...ps[(f + i) % 6])
            }
            p5.endShape(p5.CLOSE)
        }
    }

    sketch.init = () => {
        palette = getPalette()
        p5.background(palette.background)
        p5.stroke(palette.stroke)

        const r = p5.random(48, 128),
            w = Math.sqrt(3) * r,
            h = (3 / 2) * r
        const cols = p5.width / w,
            rows = p5.height / h

        let i = 0
        for (let x = -1; x <= cols + 1; x++) {
            for (let y = -1; y <= rows + 1; y++) {
                hex(
                  (x + (y % 2 === 0 ? 0.5 : 0)) * w, 
                  y * h, 
                  r, 
                  random() < 0.25 ? 4 : 3,
                  random() > 0.25 ? floor(random() * 6) : false),
                i++
            }
        }
    }

    sketch.download = () => p5.save(canvas, `hexagons.${new Date().toISOString()}`, 'jpg')

    p5.setup = () => {
        canvas = p5.createCanvas(1000, 1000)
        canvas.elt.style.aspectRatio = `1 / 1`
        sketch.init()
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)
window.infobox = infobox
window.init = sketch.init
window.download = sketch.download
handleAction()
