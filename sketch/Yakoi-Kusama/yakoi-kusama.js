let canvas

const sketch = (p5) => {
  p5.setup = () => {
    canvas = p5.createCanvas(window.innerWidth - 80, window.innerHeight - 160);
    p5.background(20);
    p5.fill('#fce414');
    p5.noLoop();
  }
  p5.draw = () => {
    const cells = p5.round(p5.random(64, 96));
    const regularSize = p5.width / cells;
    const cellSizeVariation = (regularSize / cells) * 12;

    let xIncrement = cellSizeVariation;
    let yIncrement = cellSizeVariation;
    let cellWidth = regularSize + xIncrement;
    let cellHeight = regularSize / 1.4;
    let initStep = (cellSizeVariation / cells) * regularSize;
    let xIncrementFactor = 1.5;
    let yIncrementFactor = 1.5;
    let xIncrementStep = initStep * xIncrementFactor;
    let yIncrementStep = initStep * yIncrementFactor;
    let xPos = 0;
    let yPos = 0;

    p5.background(20);

    while (xPos < p5.width) {
      if (yPos < p5.height) {
        if (yIncrement > cellSizeVariation) yIncrementStep--;

        if (yIncrement < 0) yIncrementStep++;

        yIncrement += yIncrementStep;

        cellHeight = regularSize + yIncrement;
        p5.ellipse(
          xPos + cellWidth / 2, yPos + cellHeight / 2, Math.min(cellWidth, cellHeight) * 0.8
        )

        yPos = yPos + cellHeight;
      } else {

        yIncrementStep = initStep * yIncrementFactor;
        yIncrement = -cellSizeVariation;
        yPos = 0;

        if (xIncrement > cellSizeVariation) xIncrementStep--;

        if (xIncrement < 0) xIncrementStep++;

        xIncrement += xIncrementStep;
        cellWidth = regularSize + xIncrement;
        xPos = xPos + cellWidth;
      }
    }

  }
  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth - 80, window.innerHeight - 160)
    p5.redraw()
  }
  p5.keyPressed = function () {
      p5.save(canvas, 'Yakoi-Kusama', 'jpg')
  }
  sketch.init_sketch = () => p5.redraw()
}

export default sketch
