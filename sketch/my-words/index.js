import '../full-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
const { cos, sin, hypot } = Math

// Noise dimension (change between generation)
let d = 0, canvas

const sketch = (p5) => {
  p5.setup = () => {
    canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.textFont('sans-serif');
    p5.textAlign(p5.CENTER);
    p5.noLoop()
    p5.fill(30);
  }

  p5.draw = () => {
    const flipFrontRear = Math.random() > 0.5
    const N = p5.random(16, 48);
    const R = hypot(p5.width, p5.height) / 3;
    const txt = Math.random() > 0.5
      ? 'My words fly up, my thoughts remain below'
      : 'My words have gone beyond my thought'

    p5.background(250);
    let words = txt.split(" ")

    for (let i = 0; i < words.length; i++) {
      for (let j = 0; j < words[i].length; j++) {
        let y = p5.height * p5.map(i, 0, words.length - 1, 0.2, 0.87);
        let x = p5.width * p5.map(j, 0, words[i].length, 0.3, 0.7)
        const s = R / (words[i].length * 10);

        for (let k = 0; k < N; k++) {
          p5.textSize(p5.map(k, 0, N, flipFrontRear ? s : s * 10, flipFrontRear ? 10 * s : s))
          // p5.textSize(12 + k / N * 200);
          p5.stroke(k / N * 255);

          const v = 300 * p5.noise(d + (x / p5.width) - 0.5, d + (y / p5.height) - 0.5)

          x += cos(v) * R * 0.007;
          y += sin(v) * R * 0.007;
          p5.text(words[i][j], x, y);
        }
      }
    }
  }

  sketch.init = () => {
    d++;
    p5.redraw();
  }
  sketch.exportJPG = () => p5.saveCanvas(canvas, 'My-words', 'jpg')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.init
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
