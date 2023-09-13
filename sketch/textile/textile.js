const sketch = (p5) => {
  let grid, cell, palette, margin, canvas;
  const palettes = [
    '#F1FAFD,#246023,#161922,#EA1703,#0C080B,#0173BB,#8B3014,#EEA600',
    '#FAF9E6,#5C4973,#1B0811,#321D19,#F4C808,#6487EE',
    '#D15436,#FDFCF8,#62858B,#161817,#E6C034,#6C3928,#D1BF8A',
    '#3C4755,#E5E2DC,#E3B228,#414042,#CC311A,#613A29,#372F50,#302D28',
    '#DEDFDB,#AD3F0D,#050003,#8C9F9B,#215707,#1B6D9E,#E2BB0C'
  ]
  const step = 0.35;

  p5.setup = () => {
    canvas = p5.createCanvas(
      window.innerWidth < 800 ? window.innerWidth - 80 : window.innerWidth - 160,
      window.innerHeight - 160);
    p5.pixelDensity(window.devicePixelRatio);
    p5.noLoop();
    p5.strokeCap(p5.PROJECT);
    p5.stroke(240);
    p5.noFill();

    margin = p5.width * (window.innerWidth < 800 ? 0.1 : 0.05)
  }
  const drawCurve = (x1, y1, x2, y2) => {
    const dist = Math.hypot(x1 - x2, y1 - y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const nStep = 3;
    const weight = Math.min(cell.x, cell.y) / 3

    p5.strokeWeight(weight);
    p5.beginShape()
    for (let i = 0; i < dist; i += nStep) {
      const v1 = { x: x1 + Math.cos(angle) * i, y: y1 + Math.sin(angle) * i };
      const n = 12 * p5.noise(v1.x * 0.007, v1.y * 0.007);
      const v2 = { x: v1.x + Math.cos(n) * nStep * 2, y: v1.y + Math.sin(n) * nStep * 2 };
      p5.vertex(v2.x, v2.y);
    }
    p5.endShape();

  }
  p5.draw = () => {
    grid = { x: p5.round(p5.random(16, 32)), y: p5.round(p5.random(16, 32)) }
    cell = {
      x: (p5.width - margin * 2) / grid.x,
      y: (p5.height - margin * 2) / grid.y
    }
    p5.strokeWeight(Math.min(cell.x, cell.y) / 4.5);
    palette = p5.shuffle(p5.random(palettes).split(','));

    p5.background(palette[0]);
    p5.translate(margin, margin);
    p5.push();

    for (let x = 0; x < grid.x; x++) {
      for (let y = 0; y < grid.y; y++) {
        if ((x + y) % 2 === 0) {
          // Vertical
          p5.stroke(palette[1]);
          drawCurve(cell.x * x, cell.y * (y + 0.5), cell.x * (x + 0.5 - step), cell.y * (y + 0.5));
          drawCurve(cell.x * (x + 0.5 + step), cell.y * (y + 0.5), cell.x * (x + 1), cell.y * (y + 0.5));
          // Horizontal
          p5.stroke(palette[2]);
          drawCurve(cell.x * (x + 0.5), cell.y * y, cell.x * (x + 0.5), cell.y * (y + 1));
        } else {
          // Vertical
          p5.stroke(palette[1]);
          drawCurve(cell.x * x, cell.y * (y + 0.5), cell.x * (x + 1), cell.y * (y + 0.5));
          // Horizontal
          p5.stroke(palette[2]);
          drawCurve(cell.x * (x + 0.5), cell.y * y, cell.x * (x + 0.5), cell.y * (y + 0.5 - step));
          drawCurve(cell.x * (x + 0.5), cell.y * (y + 0.5 + step), cell.x * (x + 0.5), cell.y * (y + 1));
        }
      }
    }
    p5.pop();
  }

  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth - 80, window.innerWidth - 160)
  }
  p5.keyPressed = function () {
      p5.save(canvas, 'textile', 'jpg')
  }

  sketch.init_sketch = () => p5.redraw()
}

export default sketch
