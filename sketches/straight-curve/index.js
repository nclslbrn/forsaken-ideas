// Create a grid
var sketchWidth, sketchHeight;
sketchWidth = 720;
sketchHeight = 860;

var cells = 25;
var regularSize = sketchWidth / cells;
var cellSizeVariation = (regularSize / cells) * 3;
var xIncrement, yIncrement, xIncrementStep, yIncrementStep, initStep, xIncrementFactor, yIncrementFactor;
xIncrement = yIncrement = -cellSizeVariation;

initStep = (cellSizeVariation / cells) * regularSize - 1;
xIncrementFactor = 1.5;
yIncrementFactor = .7;
xIncrementStep = initStep * xIncrementFactor;
yIncrementStep = initStep * yIncrementFactor;

var trianglesPos = [];
var cellWidth, cellHeight, xPos, yPos, totalTriangles;
cellWidth = regularSize + xIncrement;
cellHeight = regularSize + yIncrement;
xPos = yPos = totalTriangles = 0;


function setup() {

    createCanvas(sketchWidth, sketchHeight);
}

function init() {

    if (xPos < sketchWidth) {

        if (yPos < sketchHeight) {

            if (yIncrement > cellSizeVariation)
                yIncrementStep--;

            if (yIncrement < -cellSizeVariation)
                yIncrementStep++;

            yIncrement += yIncrementStep;

            cellHeight = regularSize + yIncrement;

            trianglesPos.push({
                x: xPos,
                y: yPos,
                width: cellWidth,
                height: cellHeight
            });

            yPos = yPos + cellHeight;
            totalTriangles++;

        } else { // end of column

            yIncrementStep = initStep * yIncrementFactor;
            yIncrement = -cellSizeVariation;
            yPos = 0;

            if (xIncrement > cellSizeVariation)
                xIncrementStep--;

            if (xIncrement < -cellSizeVariation)
                xIncrementStep++;

            xIncrement += xIncrementStep;
            cellWidth = regularSize + xIncrement;
            xPos = xPos + cellWidth;

        }

    } else { // last cell of the column


        background(255);
        trianglesPos = [];
        totalTriangles = xPos = yPos = 0;
        //    xIncrementFactor -= .1;
        //    yIncrementFactor -= .1;
        cells -= 3;
        //    regularSize = sketchWidth / cells;
        //    cellSizeVariation = (regularSize / cells) * (cells+4);
    }


}

function draw() {

    background(255);
    fill(0);
    init();

    for (var n = 0; n < trianglesPos.length; n++) {

        triangle(
            trianglesPos[n].x,
            trianglesPos[n].y,

            trianglesPos[n].x + trianglesPos[n].width,
            trianglesPos[n].y + trianglesPos[n].height,

            trianglesPos[n].x,
            trianglesPos[n].y + trianglesPos[n].height
        );
    }
}

function triangles(_a, _b, _c) {

    this.x = _a;
    this.y = _b;
    this.w = _b;

    this.angle = random(TWO_PI);
    this.num = int(map(this.a, this.a, this.b, this.c));
    this.display = function (a, b, c, num, red, blue) {

        triangle(x1, y1, x2, y2, x3, y3);

        for (var i = 0; i < num; i++) {

            var x = random2D
        }
    }
}