import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas, w
const { floor, random, sin, cos, sqrt, pow, PI } = Math
const E = 16, F = 0.01

const sketch = (p5) => {
   
    const isIn = (x, y, cx, cy, cw) =>
        x >= cx && x <= cx + cw && y >= cy && y <= cy + cw
    
    const stripA = (x, y, w) => {
        for (let d = w - E / 2; d > 0; d -= E) {
            p5.line(x, y + d, x + d, y)
            p5.line(x + w - d, y + w, x + w, y + w - d)
        }
    }
    
    const stripB = (x, y, w) => {
        for (let d = w - E / 2; d > 0; d -= E) {
            p5.line(x + w - d, y, x + w, y + d)
            p5.line(x, y + w - d, x + d, y + w)
        }
    }
    
    const horizontalLine = (x, y, w) => {
        for (let d = E / 2; d <= w; d += E) {
            p5.line(x, y + d, x + w, y + d)
        }
    }
    
    const verticalLine = (x, y, w) => {
        for (let d = E / 2; d <= w; d += E) {
            p5.line(x + d, y, x + d, y + w)
        }
    }

    const leftToBottomArc = (x, y, w) => {
        for (let d = E / 2; d <= sqrt(pow(w, 2) * 2); d += E) {
            p5.beginShape()
            for (let l = PI * 1.5; l <= 2 * PI; l += F) {
                const px = x + cos(l) * d
                const py = y + w + sin(l) * d
                if (isIn(px, py, x, y, w)) p5.vertex(px, py)
            }
            p5.endShape()
        }
    }
    const bottomToRightArc = (x, y, w) => {
        for (let d = E / 2; d <= sqrt(pow(w, 2) * 2); d += E) {
            p5.beginShape()
            for (let l = PI; l <= PI * 1.5; l += F) {
                const px = x + w + cos(l) * d
                const py = y + w + sin(l) * d
                if (isIn(px, py, x, y, w)) p5.vertex(px, py)
            }
            p5.endShape()
        }
    }
    const rightToTopArc = (x, y, w) => {
        for (let d = E / 2; d <= sqrt(pow(w, 2) * 2); d += E) {
            p5.beginShape()
            for (let l = PI * 0.5; l <= PI; l += F) {
                const px = x + w + cos(l) * d
                const py = y + sin(l) * d
                if (isIn(px, py, x, y, w)) p5.vertex(px, py)
            }
            p5.endShape()
        }
    }
    const topToLeftArc = (x, y, w) => {
        for (let d = E / 2; d <= sqrt(pow(w,2)*2); d += E) {
            p5.beginShape()
            for (let l = 0; l <= PI / 2; l += F) {
                const px = x + cos(l) * d
                const py = y + sin(l) * d
                if (isIn(px, py, x, y, w)) p5.vertex(px, py)
            }
            p5.endShape()
        }
    }
    
    const leftToBottomCorner = (x, y, w) => {
        for ( let d = E/2; d <= w; d += E) {
          p5.line(x, y+w-d, x+d, y+w-d)
          p5.line(x+d, y+w-d, x+d, y+w)
        }
    }

    const bottomToRightCorner = (x, y, w) => {
        for (let d = E/2; d <= w; d += E) {
            p5.line(x+w-d, y+w, x+w-d, y+w-d)
            p5.line(x+w-d, y+w-d, x+w, y+w-d)
        }
    }
    
    const rightToTopCorner = (x, y, w) => {
        for (let d = E/2; d <= w; d += E) {
            p5.line(x+w, y+d, x+w-d, y+d)
            p5.line(x+w-d, y+d, x+w-d, y)
        }
    }
    
    const topToLeftCorner = (x, y, w) => {
        for (let d = E/2; d <= w; d += E) {
            p5.line(x+d, y, x+d, y+d)
            p5.line(x+d, y+d, x, y+d)
        }
    }
    
    const uBottom = (x, y, w) => {
        for (let d = E/2; d <= w/2; d += E) {
            p5.line(x+w/2-d, y+w, x+w/2-d, y+w-d*2)
            p5.line(x+w/2-d, y+w-d*2, x+w/2+d, y+w-d*2)
            p5.line(x+w/2+d, y+w-d*2, x+w/2+d, y+w)
        }
    }
    
    const uRight = (x, y, w) => {
        for (let d = E/2; d <= w/2; d += E) {
            p5.line(x+w, y+w/2-d, x+w-d*2, y+w/2-d)
            p5.line(x+w-d*2, y+w/2-d, x+w-d*2, y+w/2+d)
            p5.line(x+w-d*2, y+w/2+d, x+w, y+w/2+d)
        }
    }
    
    const uTop = (x, y, w) => {
        for (let d = E/2; d <= w/2; d += E) {
            p5.line(x+w/2-d, y, x+w/2-d, y+d*2)
            p5.line(x+w/2-d, y+d*2, x+w/2+d, y+d*2)
            p5.line(x+w/2+d, y+d*2, x+w/2+d, y)
        }
    }

    const uLeft = (x, y, w) => {
        for (let d = E/2; d <= w/2; d+= E) {
            p5.line(x, y+w/2-d, x+d*2, y+w/2-d)
            p5.line(x+d*2, y+w/2-d, x+d*2, y+w/2+d)
            p5.line(x+d*2, y+w/2+d, x, y+w/2+d)
        }
    }

    const drawCell = [
        stripA,
        stripB,
        horizontalLine,
        verticalLine,
        leftToBottomCorner,
        bottomToRightCorner,
        rightToTopCorner,
        topToLeftCorner,
        uBottom,
        uRight,
        uTop,
        uLeft,
        leftToBottomArc,
        bottomToRightArc,
        rightToTopArc,
        topToLeftArc
    ]

    p5.setup = () => {
        canvas = p5.createCanvas(1152, 1152)
        w = p5.width / 18
        p5.noFill()
        p5.stroke(250)
        p5.strokeWeight(1.5)
        sketch.init()
    }
    sketch.init = () => {
        p5.background(10)
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                drawCell[floor(random() * drawCell.length)](
                    (x + 1) * w,
                    (y + 1) * w,
                    w
                )
            }
        }
    }

    sketch.capture = () => p5.saveCanvas(canvas, '16×16.jpg')
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.infobox = infobox
handleAction()
