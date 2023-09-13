import '../framed-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
const { abs, pow, acos, max, sqrt, cos, sin, sign, hypot, random } = Math

const sketch = (p5) => {

  let numFrame, res, isInverted, binaryMode;


  p5.setup = () => {
    let canvas = p5.createCanvas(900, 900);
    canvas.elt.style.aspectRatio = `1 / 1`

    p5.noStroke();
    p5.textSize(12);
    p5.textFont('sans-serif');
    p5.textAlign(p5.CENTER);
    sketch.initSketch();
  }

  // Piter Pasma repetitor funtion 
  // https://editor.p5js.org/triplezero/sketches/IeE6fvLY7
  function sdf_rep (x, r) {
    x /= r;
    x -= Math.floor(x) + .5;
    x *= r;
    return x;
  }
  // Adapted from a GLSL function by Inigo Quilez
  // https://iquilezles.org/articles/distfunctions2d/ Ellipse exact
  function sdf_ellipse ([x, y], [a, b]) {
    x = abs(x);
    y = abs(y);

    if (x > y) {
      const _x = x, _y = y, _a = a, _b = b;
      x = _y;
      y = _x;
      a = _b;
      b = _a;
    }

    const l = b * b - b * a;
    const m = a * x / l;
    const n = b * y / l;
    const m2 = m * m;
    const n2 = n * n;

    const c = (m2 + n2 - 1.0) / 3.0;
    const c3 = c * c * c;

    const d = c3 + m2 * n2;
    const q = d + m2 * n2;
    const g = m + m * n2;

    let co;

    if (d < 0.0) {
      const h = acos(q / c3) / 3.0;
      const s = cos(h) + 2.0;
      const t = sin(h) * sqrt(3.0);
      const rx = sqrt(m2 - c * (s + t));
      const ry = sqrt(m2 - c * (s - t));
      co = ry + sign(l) * rx + abs(g) / (rx * ry);
    } else {
      const h = 2.0 * m * n * sqrt(d);
      const s = Math.sign(q + h) * pow(abs(q + h), 1.0 / 3.0);
      const t = Math.sign(q - h) * pow(abs(q - h), 1.0 / 3.0);
      const rx = -(s + t) - c * 4.0 + 2.0 * m2;
      const ry = (s - t) * sqrt(3.0);
      const rm = sqrt(rx * rx + ry * ry);
      co = ry / sqrt(rm - rx) + 2.0 * g / rm;
    }
    co = (co - m) / 2.0;

    const si = sqrt(max(1.0 - co * co, 0.0));
    const rx = a * co;
    const ry = b * si;

    return hypot(rx - x, ry - y) * sign(y - ry);
  }
  // Adapted from a GLSL function by Inigo Quilez
  // https://iquilezles.org/articles/distfunctions2d/ Equilateral Triangle - exact
  function sdf_equiTriangle ([x, y]) {
    const k = sqrt(3);
    x = abs(x) - 1;
    y = y + 1 / k;
    if (x + k * y > 0.0) {
      const _x = x, _y = y;
      x = (_x - k * _y) / 2;
      y = (-k * _x - _y) / 2;
    }
    x -= p5.constrain(x, -2, 0);
    return hypot(x, y) * sign(y);
  }


  p5.draw = () => {
    p5.background(isInverted ? 20 : 245);
    const t = 1 - (p5.frameCount % numFrame) / numFrame;
    for (let i = -res; i <= res; i += 0.025) {
      for (let j = -res; j <= res; j += 0.035) {
        const x = p5.width / 2 + i * p5.width * 0.4,
          y = p5.height / 2 + j * p5.height * 0.4,
          ell = sdf_rep(sdf_ellipse([i, j], [1.4 + t, 2 + t]), 0.5) + 0.25,
          tri = sdf_rep(sdf_equiTriangle([i, j]), 0.5) + 0.25,
          sdf = Math.max(ell, (tri + t) % 0.5);

        if (binaryMode) {
          p5.text(sdf < 0.5 && sdf > 0.35 ? '0' : '1', x, y)
        } else {
          if (sdf < 0.5 && sdf > 0.35) {
            p5.fill(isInverted ? 240 : 20);
          } else {
            p5.fill(isInverted ? 20 : 240);
          }
          p5.rect(x, y, 6, 8)
        }
      }
    }
  }
  sketch.initSketch = () => {
    isInverted = random() > 0.5;
    binaryMode = random() > 0.5;
    numFrame = Math.ceil(p5.random(80, 150));
    res = Math.round(p5.random(0.5, 1.2) * 100) / 100;

    p5.fill(isInverted ? 240 : 20);
    p5.stroke(isInverted && !binaryMode ? 240 : 20);

  }
  sketch.exportJPG = () => p5.save('art-déco')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.initSketch
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
