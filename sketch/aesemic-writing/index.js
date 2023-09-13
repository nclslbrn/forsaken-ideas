import '../framed-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { autoBezierCurve } from './bezierCurve'

const { ceil, random } = Math

const sketch = (p5) => {
  let pg, palette
  const palettes = [
    '#F1FAFD;:#246023;:#161922;:#EA1703;:#0C080B;:#0173BB;:#8B3014;:#EEA600',
    '#FAF9E6;:#5C4973;:#1B0811;:#321D19;:#F4C808;:#6487EE',
    '#F2F5EC;:#D15436;:#62858B;:#161817;:#E6C034;:#6C3928;:#D1BF8A',
    '#FDFCF8;:#3C4755;:#E3B228;:#414042;:#CC311A;:#613A29;:#372F50;:#302D28',
    '#DEDFDB;:#AD3F0D;:#050003;:#8C9F9B;:#215707;:#1B6D9E;:#E2BB0C'
  ]

  const letterSize = { x: 1080, y: 1420 } // { x: window.innerWidth, y: window.innerHeight }
  const margin = { x: letterSize.x * 0.2, y: letterSize.y * 0.1 }
  let dx = margin.x,
    dy = margin.y,
    signSize

  const letter = () => {
    const randPoints = Array.from(Array(ceil(p5.random(3, 4)))).map(() => {
      return {
        x: dx + signSize.x * 0.5 + (random() - 0.5) * signSize.x * 0.9,
        y: dy + signSize.y * 0.5 + (random() - 0.5) * signSize.y * 0.35
      }
    })
    const bezier = autoBezierCurve(randPoints, 5 * random())
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
  }

  p5.setup = () => {
    let canvas = p5.createCanvas(letterSize.x, letterSize.y)
    canvas.elt.style.aspectRatio = `${letterSize.x} / ${letterSize.y}`
    
    pg = p5.createGraphics(letterSize.x, letterSize.y)
    p5.pixelDensity(window.devicePixelRatio || 1)
    p5.noLoop()
    p5.rectMode(p5.RADIUS)
    // create a paper texture
    for (let x = 0; x < letterSize.x; x += 2) {
      for (let y = 0; y < letterSize.y; y += 2) {
        const rand = random()
        if (rand < 0.25) {
          pg.stroke(rand, 25)
          pg.ellipse(x, y, 0.5)
        }
      }
    }
  }

  p5.draw = () => {
    palette = p5.random(palettes).split(';:')
    p5.background(palette[0])
    p5.image(pg, 0, 0)

    p5.noFill()
    p5.stroke(30)
    p5.strokeWeight(1 + random() * 2)

    signSize = { x: ceil(p5.random(16, 24)), y: ceil(p5.random(32, 48)) }

    p5.beginShape()
    p5.vertex(dx, dy)

    while (dy < letterSize.y - margin.y - signSize.y) {
      if (dx < letterSize.x - margin.x - signSize.x) {
        if (random() > 0.2) {
          letter()
          dx += signSize.x
        } else {
          p5.endShape()
          dx += signSize.x
          p5.beginShape()
          p5.vertex(dx, dy)
        }
      } else {
        p5.endShape()
        if (random() > 0.2) {
          dy += signSize.y
        }
        dy += signSize.y
        dx = margin.x
        p5.beginShape()
        p5.vertex(dx, dy)
      }
    }

    // Signature
    dy += signSize.y * 0.5
    signSize.x *= 0.5
    signSize.y *= 0.5
    dx = letterSize.x - (signSize.x * 3 + margin.x)
    p5.beginShape()
    p5.vertex(dx, dy)
    letter()
    dx += signSize.x
    letter()
    p5.endShape()
    p5.noStroke()
  }

  p5.mouseClicked = () => {
    dx = margin.x
    dy = margin.y
    p5.redraw()
  }

  p5.keyPressed = (event) => {
    if (event.key && (event.key === 'd' || event.key === 'D')) {
      p5.save('Aesemic-writing')
    }
  }
  sketch.initSketch = () => p5.redraw()
  sketch.exportJPG = () => p5.save('Aesemic-writing')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.initSketch
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
