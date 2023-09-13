const sketch = (p5) => {
    let arcs = []
    let numFrames = 125
    let margin = 32, // margin between circle
        noiseRadius = 4,
        noiseStrength = 100,
        lineSize = 12,
        speed = 0, // the value wich increments circle's radiuses
        maxRadius = 0 // Limit the size of the arc circle

    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : window.innerWidth,
            h: side > 800 ? 800 : window.innerHeight
        }
    }
    sketch.init = () => {
        const center = p5.createVector(p5.width / 2, p5.height / 2)
        maxRadius = p5.width
        speed = maxRadius / numFrames

        for (var c = margin; c <= maxRadius; c += margin) {
            let newArc
            newArc = new EllipseSection(c, 0, [], center)
            newArc.init()
            arcs.push(newArc)
        }
    }
    const getNoiseIntensity = function (x, y, t) {
        return (
            p5.noise(
                x + noiseRadius * p5.cos(p5.TWO_PI * t),
                y + noiseRadius * p5.sin(p5.TWO_PI * t)
            ) * noiseStrength
        )
    }

    p5.setup = () => {
        const sketchDim = sketchSize()
        let canvas = p5.createCanvas(sketchDim.w, sketchDim.h, p5.WEBGL)
        canvas.elt.style.aspectRatio = '1 / 1'
        //p5.smooth(20)
        sketch.init()
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
                var lineWeight = p5.map(arc.radius, 0, maxRadius, 1, 8)

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
    p5.windowResized = () => {
        const size = sketchSize()
        p5.resizeCanvas(size.w, size.h)
        sketch.init()
    }

    class EllipseSection {
        constructor(radius, initialAngle, angles, center) {
            this.radius = radius
            this.initialAngle = initialAngle
            this.angles = angles
            this.center = center
        }
        init () {
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
