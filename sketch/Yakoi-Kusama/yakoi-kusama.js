const sketch = (p5) => {
  p5.setup = () => {
    p5.createCanvas(1200, 630);
    p5.background(20);
    p5.fill('#fce414');
    p5.noLoop();
  }
  p5.draw = () => {
    const cells = p5.round(p5.random(48, 64));
    const regularSize = window.innerWidth / cells;
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

    while (xPos < window.innerWidth) {
      if (yPos < window.innerHeight) {
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
    p5.resizeCanvas(window.innerWidth, window.innerHeight)
  }
  sketch.init_sketch = () => p5.redraw()
}

export default sketch
