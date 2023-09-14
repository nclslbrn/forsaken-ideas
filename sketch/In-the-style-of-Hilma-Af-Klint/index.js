import '../full-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { autoBezierCurve } from '../../sketch-common/bezierCurve'
const { cos, sin, round, tan, atan2, hypot, PI } = Math

const sketch = (p5) => {
  const maxR = 16
  const palettes = [
    '#E9F8F6, #F1FAFD, #246023, #161922, #EA1703,#0C080B,#0173BB,#8B3014,#EEA600',
    '#CED3D5, #FAF9E6, #5C4973, #1B0811,#321D19,#F4C808,#6487EE',
    '#F2F5EC, #D15436, #FDFCF8, #62858B, #161817, #E6C034, #6C3928, #D1BF8A',
    '#E4DCC8, #3C4755, #E5E2DC, #E3B228, #414042, #CC311A, #613A29, #372F50, #302D28',
    '#DEDFDB, #AD3F0D, #050003, #8C9F9B, #215707, #1B6D9E, #E2BB0C'
  ]
  let diag
  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.noLoop()
    p5.noStroke()

    diag = hypot(p5.width, p5.height)
  }
  // Margin a percent of width & height
  const randPos = (margin = 0) => [
    p5.random(margin, 1 - margin) * p5.width, p5.random(margin, 1 - margin) * p5.height
  ]

  const scribbleSquare = (x, y, w) => {
    const points = [[], [], [], []]
    for (let d = 0; d < w; d += 3) {
      points[0].push([x + d, y])
      points[1].push([x + w, y + d])
      points[2].push([x + w - d, y + w])
      points[3].push([x, y + w - d])
    }
    p5.beginShape()
    points.map((line) => {
      line.forEach((pt) => p5.vertex(pt[0] + p5.random(-3, 3), pt[1] + p5.random(-3, 3)))
    })
    p5.endShape(p5.CLOSE)
  }

  p5.draw = () => {
    let palette = p5.random(palettes).split(',');
    p5.drawingContext.globalCompositeOperation = 'source-over'

    p5.background(palette[0]);
    palette.splice(0, 1)
    p5.noStroke()
    // Tiny drop // paper texture
    for (let i = 0; i < 1000; i++) {
      let [x, y] = randPos(),
        r = p5.random(1, 8);

      const ellAlpha = Number(round(100 - (100 * (r / 8)))).toString(16);
      const alphaSuff = ellAlpha.length == 1 ? '0' + ellAlpha : ellAlpha
      p5.fill(palette[0] + alphaSuff);
      p5.ellipse(x, y, r);

      if (r >= maxR - 1) {
        let angle = atan2(p5.height / 2 - y, p5.width / 2 - x);
        while (r > 1) {
          x += cos(angle) * r * 0.75;
          y += sin(angle) * r * 0.75;
          r -= 0.5;
          angle = tan(angle * 1.75)
          p5.ellipse(x, y, r)
        }
      }
    }
    p5.drawingContext.globalCompositeOperation = 'multiply'
    // grid
    const step = round(p5.width / p5.random(8, 16))
    for (let x = step; x < p5.width - step * 2; x += step) {
      for (let y = step; y < p5.height - step * 2; y += step) {
        if (p5.random() > 0.5) {
          const alpha = Number(round(p5.random() * 100)).toString(16)
          p5.fill(p5.random(palette) + alpha)
          scribbleSquare(x, y, step)
        }
      }
    }

    p5.noFill()
    // Spirali
    const ellPoints = []
    for (let i = 0; i < p5.random(1, 3); i++) {
      let [x, y] = randPos(0.1)
      let eX = x, eY = y, rot = 0, rad = 1
      while (eX > 0 && eY > 0 && eX < p5.width && eY < p5.height) {
        // p5.vertex(eX, eY)
        ellPoints.push({ x: eX, y: eY })
        eX = x + cos(rot) * rad * (0.75 - p5.random(0.05, 0.08))
        eY = y + sin(rot) * rad * (1.24 + p5.random(0.05, 0.08))
        rad += rad * 0.003
        rot += 0.05

        if (p5.random() < 0.001) {

          const nX = p5.width - x
          const nY = p5.height - y
          const distance = hypot(x - nX, y - nY) * 0.66
          const theta = atan2(nY - y, nX - x)

          for (let d = 2; d < distance; d += 64) {
            const vd = ((d / distance) - 0.5) * theta * 2
            ellPoints.push({
              x: x + d * cos(theta + cos(vd)) + p5.random(0.01, 0.07) * diag,
              y: y + d * sin(theta + sin(vd)) + p5.random(0.01, 0.07) * diag
            })


          }
          x = nX
          y = nY
          rot = PI - rot
          rad = -rad
        }

      }
      for (let j = 0; j < p5.random(1, 3); j++) {
        let [x, y] = randPos(0.1)
        ellPoints.push({ x, y })
      }
    }

    p5.stroke(50)
    const bezier = autoBezierCurve(ellPoints, 3 * Math.random().toFixed(3))
    for (let i = 0; i < bezier.length; i++) {
      if (bezier[i].length > 2) {
        p5.bezierVertex(
          bezier[i][0].x,
          bezier[i][0].y,
          bezier[i][1].x,
          bezier[i][1].y,
          bezier[i][2].x,
          bezier[i][2].y
        )
      }
    }
    //ellPoints.map(pt => p5.vertex(pt.x, pt.y))
    p5.endShape()
  }
  sketch.initSketch = () => p5.redraw()
  sketch.exportJPG = () => p5.save('In-the-style-of-Hilma-Af-Klint')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.initSketch
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
