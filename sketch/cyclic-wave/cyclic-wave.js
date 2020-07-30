const sketch = (p5) => {
    let arcs = []
    let numFrames = 125
    let margin = 16, // margin between circle
        noiseScale = 16,
        noiseRadius = 6,
        noiseStrength = 1,
        lineSize = 8,
        speed = 0, // the value wich increments circle's radiuses
        maxRadius = 0 // Limit the size of the arc circle

    const getNoiseIntensity = function (x, y, t) {
        return (
            p5.noise(
                noiseRadius * p5.cos(p5.TWO_PI * t),
                noiseRadius * p5.sin(p5.TWO_PI * t)
            ) * noiseStrength
        )
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL)
        p5.smooth(20)
        const center = p5.createVector(
            window.innerWith / 2,
            window.innerHeight / 2
        )
        maxRadius = window.innerHeight / 2.5
        speed = maxRadius / numFrames

        for (var c = margin; c <= maxRadius; c += margin) {
            let newArc
            newArc = new EllipseSection(c, 0, [], center)
            newArc.init()
            arcs.push(newArc)
        }
    }

    p5.draw = () => {
        p5.background(0)
        p5.push()
        p5.rotateX(p5.PI / 3)

        var t =
            (1.0 *
                (p5.frameCount < numFrames
                    ? p5.frameCount
                    : p5.frameCount % numFrames)) /
            numFrames

        for (var arcID = 0; arcID < arcs.length; arcID++) {
            var arc = arcs[arcID]
            var currentAngle = arc.initialAngle

            for (
                var angleID = 0;
                angleID < arc.angles.length - 1;
                angleID += 2
            ) {
                var strokeColor = p5.map(arc.radius, 0, maxRadius, 255, 0)
                var lineWeight = p5.map(arc.radius, 0, maxRadius, 0.5, 2)

                var start = currentAngle + arc.angles[angleID]
                var end = currentAngle + arc.angles[angleID + 1]

                var startPoint = p5.createVector(
                    arc.radius * p5.cos(start),
                    arc.radius * p5.sin(start)
                )

                var endPoint = p5.createVector(
                    arc.radius * p5.cos(end),
                    arc.radius * p5.sin(end)
                )

                var distance = startPoint.dist(endPoint)
                var currentPoint = startPoint

                p5.stroke(strokeColor)
                p5.strokeWeight(lineWeight)
                p5.beginShape(p5.LINES)

                for (var d = 0; d <= distance; d += lineSize) {
                    var ratio = d / distance

                    var x = startPoint.x + (endPoint.x - startPoint.x) * ratio
                    var y = startPoint.y + (endPoint.y - startPoint.y) * ratio

                    var pointNoise = getNoiseIntensity(x, y, t)
                    p5.curveVertex(currentPoint.x, currentPoint.y, 0)
                    p5.curveVertex(
                        x + noiseRadius * p5.cos(pointNoise),
                        y + noiseRadius * p5.sin(pointNoise),
                        0
                    )

                    currentPoint = p5.createVector(x, y)
                }
                p5.endShape()
                currentAngle = end
            }
            arc.radius += speed

            if (arc.radius >= maxRadius) {
                if (arcID != 1) {
                    arc.radius = margin
                }
            }
        }
        p5.pop()
    }

    class EllipseSection {
        constructor(radius, initialAngle, angles, center) {
            this.radius = radius
            this.initialAngle = initialAngle
            this.angles = angles
            this.center = center
        }
        init() {
            var angles = []
            var initialAngle = 0
            var newAngle = 0

            while (initialAngle <= p5.TWO_PI) {
                newAngle = p5.random(p5.TWO_PI / 12)

                angles.push(newAngle)

                initialAngle += newAngle
            }
            this.angles = angles
            this.initialAngle = p5.random(p5.TWO_PI)
        }
    }
}

export default sketch
