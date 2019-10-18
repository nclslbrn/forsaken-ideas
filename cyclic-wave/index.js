/// <reference path="../node_modules/@types/p5/global.d.ts" />
const containerElement = document.body
const loader = document.getElementById('p5_loading')
import style from '../src/sass/project.scss'
import p5 from "p5"

const sketch = (p) => {
    let arcs = []
    let numFrames = 75
    let margin = 12, // margin between circle
        noiseScale = 256,
        noiseRadius = 3,
        noiseStrength = 1.5,
        lineSize = 4,
        speed = 0, // the value wich increments circle's radiuses
        maxRadius = 0; // Limit the size of the arc circle

    const getNoiseIntensity = function(x, y, t) {

        return p.noise(
            noiseRadius * p.cos(p.TWO_PI * t),
            noiseRadius * p.sin(p.TWO_PI * t)
        ) * noiseStrength
    }

    p.setup = () => {

        p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL)
        p.smooth(20)
        const center = p.createVector(window.innerWith / 2, window.innerHeight / 2)
        maxRadius = window.innerHeight / 2.5
        speed = maxRadius / numFrames

        for (var c = margin; c <= maxRadius; c += margin) {

            let newArc
            newArc = new EllipseSection(c, 0, [], center)
            newArc.init()
            arcs.push(newArc)
        }
    }

    p.draw = () => {
        p.background(0)
        p.push()
        p.rotateX(p.PI / 3)

        var t = 1.0 * (p.frameCount < numFrames ? p.frameCount : p.frameCount % numFrames) / numFrames

        for (var arcID = 0; arcID < arcs.length; arcID++) {

            var arc = arcs[arcID]
            var currentAngle = arc.initialAngle

            for (var angleID = 0; angleID < arc.angles.length - 1; angleID += 2) {

                var strokeColor = p.map(arc.radius, 0, maxRadius, 255, 0)
                var lineWeight = p.map(arc.radius, 0, maxRadius, 0.1, 1.5)

                var start = currentAngle + arc.angles[angleID]
                var end = currentAngle + arc.angles[angleID + 1]

                var startPoint = p.createVector(
                    arc.radius * p.cos(start),
                    arc.radius * p.sin(start)
                );

                var endPoint = p.createVector(
                    arc.radius * p.cos(end),
                    arc.radius * p.sin(end)
                );

                var distance = startPoint.dist(endPoint)
                var currentPoint = startPoint

                p.stroke(strokeColor)
                p.strokeWeight(lineWeight)

                for (var d = 0; d <= distance; d += lineSize) {

                    var ratio = d / distance

                    var x = startPoint.x + (endPoint.x - startPoint.x) * ratio;
                    var y = startPoint.y + (endPoint.y - startPoint.y) * ratio;

                    var pointNoise = getNoiseIntensity(x, y, t)

                    p.beginShape(p.LINES)
                    p.vertex(currentPoint.x, currentPoint.y, 0)
                    p.vertex(
                        x + noiseRadius * p.cos(pointNoise),
                        y + noiseRadius * p.sin(pointNoise),
                        0
                    );
                    p.endShape()

                    currentPoint = p.createVector(x, y);
                }
                currentAngle = end
            }
            arc.radius += speed

            if (arc.radius >= maxRadius) {
                if (arcID != 1) {
                    arc.radius = margin;
                }
            }
        }
        p.pop();
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

            while (initialAngle <= p.TWO_PI) {

                newAngle = p.random(p.TWO_PI / 12);

                angles.push(newAngle)

                initialAngle += newAngle

            }
            this.angles = angles
            this.initialAngle = p.random(p.TWO_PI)
        }
    }
}
const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)