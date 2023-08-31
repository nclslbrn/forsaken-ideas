const sketch = (p5) => {
  let canvas, ctr, minD
  const iso = (pt) => {
    return {
      x: ctr.x + pt.x - pt.y,
      y: ctr.y * 1.2 + (pt.x + pt.y) / 2
    }
  }

  const drawParallelLines = (fillColor, mask = false) => {
    p5.drawingContext.save();
    if (mask) {
      p5.noStroke();
      p5.fill(...fillColor);
      p5.beginShape();
      mask.forEach((pt) => p5.vertex(pt.x, pt.y));
      p5.endShape(p5.CLOSE);
      p5.drawingContext.clip();
    }
    const dy = p5.random(0.25, 0.75) * p5.height * 0.5;
    const step = p5.random(0.5, 12);
    p5.stroke(50);
    p5.noFill();

    for (let y = -dy; y <= p5.height + dy; y += step) {
      p5.line(0, y, p5.width, y + dy * p5.random(0.95, 1));
    }
    p5.drawingContext.restore();
  }

  p5.setup = () => {
    canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.noLoop();
    p5.stroke(50);
    p5.fill(255, 200);
    p5.rect(p5.width * 0.2, p5.height * 0.4, p5.width * 0.6, p5.height * 0.2);

    ctr = { x: p5.width / 2, y: p5.height / 2 }
    minD = Math.min(p5.width, p5.height) / 2

  }

  p5.draw = () => {

    const compAngle = Math.PI * 0.5 * p5.random();
    const margin = 60
    p5.background(255, 235, 235);
    p5.noFill();
    const innerCanvas = [
      { x: margin, y: margin }, { x: p5.width - margin, y: margin },
      { x: p5.width - margin, y: p5.height - margin }, { x: margin, y: p5.height - margin }
    ]
    drawParallelLines([255, 236, 236], innerCanvas);
    drawParallelLines([0, 0, 0, 0], innerCanvas);


    const shapes = []
    for (let i = 0; i < 6 + p5.random() * 18; i++) {
      const shpRot = p5.PI / Math.ceil(p5.random() * 3)
      const shpCenter = {
        x: (p5.random() - 0.5) * minD * 0.5,
        y: (p5.random() - 0.5) * minD * 0.5
      }
      const shapeSize = p5.createVector(
        Math.max(ctr.x * 0.1, minD * p5.random() * 0.75),
        Math.max(ctr.y * 0.05, minD * p5.random() * 0.2)
      );
      // Create two points to define an edge
      const shpStart = {
        x: shpCenter.x - shapeSize.x / 2 * Math.cos(shpRot + compAngle),
        y: shpCenter.y - shapeSize.x / 2 * Math.sin(shpRot + compAngle),
      }
      const shpEnd = {
        x: shpCenter.x + shapeSize.x / 2 * Math.cos(shpRot + compAngle),
        y: shpCenter.y + shapeSize.x / 2 * Math.sin(shpRot + compAngle),
      }
      // Then create a path around it
      const shapePts = [{
        x: shpStart.x + Math.cos(shpRot + compAngle - p5.HALF_PI) * shapeSize.y,
        y: shpStart.y + Math.sin(shpRot + compAngle - p5.HALF_PI) * shapeSize.y
      }, {
        x: shpEnd.x + Math.cos(shpRot + compAngle - p5.HALF_PI) * shapeSize.y,
        y: shpEnd.y + Math.sin(shpRot + compAngle - p5.HALF_PI) * shapeSize.y
      }, {
        x: shpEnd.x + Math.cos(shpRot + compAngle + p5.HALF_PI) * shapeSize.y,
        y: shpEnd.y + Math.sin(shpRot + compAngle + p5.HALF_PI) * shapeSize.y
      }, {
        x: shpStart.x + Math.cos(shpRot + compAngle + p5.HALF_PI) * shapeSize.y,
        y: shpStart.y + Math.sin(shpRot + compAngle + p5.HALF_PI) * shapeSize.y
      }];
      shapes.push({
        center: shpCenter,
        pts: shapePts,
        rot: shpRot
      })
    }
    // Order shapes from top left to bottom right
    shapes.sort((a, b) => a.center.x < b.center.x || a.center.y < b.center.y)

    // Build visible side of these shapes
    const isoShapes = []
    shapes.forEach((shp, i) => {
      const shpHeight = minD * p5.random(0.15, 0.5)
      // Project these points into an isometric grid
      const base = shp.pts.map((pt) => iso(pt))
      // Find the highest point of the shape
      const highestPt = [...base].sort((a, b) => a.y - b.y)[0]
      const highestPtId = base.indexOf(highestPt)
      // And build sides from it
      const bottom = []
      for (let i = 0; i < 4; i++) {
        const pt = base[(highestPtId + i) % base.length]
        bottom.push({ x: pt.x, y: pt.y })
      }
      const top = bottom.map((pt) => { return { x: pt.x, y: pt.y - shpHeight } })
      isoShapes.push({
        bottom: bottom,
        left: [top[3], top[2], bottom[2], bottom[3]],
        right: [top[2], top[1], bottom[1], bottom[2]],
        top: top,
        height: shpHeight
      })
    })

    // Then draw side
    isoShapes.forEach((iso, i) => {
      drawParallelLines([255, 255, 255, 200], iso.bottom);
      drawParallelLines([0, 0, 0, 0], iso.bottom);
      drawParallelLines([255, 255, 255, 200], iso.left);
      drawParallelLines([0, 0, 0, 0], iso.left);
      drawParallelLines([255, 255, 255, 200], iso.right);
      drawParallelLines([0, 0, 0, 0], iso.right);
      drawParallelLines([255, 255, 255, 200], iso.top);
      drawParallelLines([0, 0, 0, 0], iso.top);
    })
  }

  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
    ctr = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    minD = Math.min(window.innerWidth, window.innerHeight) / 2;
    redraw();
  }
  sketch.init_sketch = () => p5.redraw()
  sketch.download = () => {
    const date = new Date()
    const filename =
      'More-random-moiré.' +
      '-' +
      date.getHours() +
      '.' +
      date.getMinutes() +
      '.' +
      date.getSeconds()
    p5.save(canvas, filename, 'png')
  }
}

export default sketch
