var n_triangles, rotation, frame, stopFrame, cacheCanvas;
var triangles;
var colors = [];
var colors_name = [];

function setup() {
    colors = [
        '#1abc9c', '#16a085',
        '#2ecc71', '#27ae60',
        '#3498db', '#2980b9',
        '#9b59b6', '#8e44ad',
        '#34495e', '#2c3e50',
        '#f1c40f', '#f39c12',
        '#e67e22', '#d35400',
        '#e74c3c', '#c0392b',
        '#ecf0f1', '#000000',
        '#95a5a6', '#7f8c8d'
    ];

    cacheCanvas = createCanvas(displayWidth, displayHeight);
    frameRate(24);
    smooth(0);
    noFill();
    background(0);
    pixelDensity(2);
    frame = 0;
    stopFrame = 0;
    initSketch();
    background(0);

}

function draw() {

    frame = frameCount - stopFrame;
    push();

    if (frame > 260) {

        rotate(rotation);
        rotation++;
    }

    for (var t = 0; t < triangles.length; t++) {

        triangles[t].display(
            triangles[t].a,
            triangles[t].b,
            triangles[t].c,
            triangles[t].color
        );

    }
    pop();

    if (frame > 350) {

        saveCanvas(cacheCanvas, 'random-triangles' + frameCount, 'png');
        stopFrame = frameCount;
        background(0);
        initSketch();

    }
}

function initTriangles() {

    for (var n_triangle = 1; n_triangle <= n_triangles; n_triangle++) {

        var color = round(random(colors.length - 1));
        var points = getRandomPoints();

        triangles.push(
            new Triangle(
                points[1],
                points[2],
                points[3],
                color
            )
        );

    }
}

function initSketch() {

    n_triangles = 15;
    rotation = 0.00001;
    triangles = [];

    initTriangles();
}

function getRandomPoints() {

    var points = [];

    for (n_point = 0; n_point <= 3; n_point++) {

        var x_factor = round(random(0, 16));
        var y_factor = round(random(0, 9));

        points[n_point] = {
            x: x_factor * (width / 16),
            y: y_factor * (height / 9)
        };

    }

    return points;
}

function Triangle(a, b, c, color) {

    this.a = a;
    this.b = b;
    this.c = c;
    this.color = color;

    this.display = function (a, b, c, color) {

        stroke(colorAlpha(colors[color], .5));

        var ab = {
            x: a.x - b.x,
            y: a.y - b.y
        }
        var ac = {
            x: a.x - c.x,
            y: a.y - c.y
        };

        var point_by_frame = max(b.x - a.x, a.x - b.x, c.x - a.x, a.x - c.x, b.x - c.x, c.x - a.x);

        for (var n = 0; n < point_by_frame; n++) {

            var r = random(-1, 0);
            var s = random(-1, 0);

            if (r + s >= -1) {

                point(
                    (a.x + r * ab.x + s * ac.x),
                    (a.y + r * ab.y + s * ac.y)
                );

            }
        }
    }
}

function colorAlpha(aColor, alpha) {
    var c = color(aColor);
    return color('rgba(' + [red(c), green(c), blue(c), alpha].join(',') + ')');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initSketch();
}

window.addEventListener("resize", function () {
    windowResized();
});