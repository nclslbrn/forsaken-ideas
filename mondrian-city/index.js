import style from '../src/sass/project.scss'
import p5 from "p5"
import p5Collide2D from '../tools/p5.collide2D/p5.collide2d.js'
import * as tome from 'chromotome';
const palette = tome.get('tundra2');

////////////////////////////////////////////////////
const containerElement = document.body
const loader = document.getElementById('p5_loading')
////////////////////////////////////////////////////
const sketch = (p5) => {

    const roads = []
    const builds = []

    const blockProperty = (minWidth, maxWidth, minHeight, maxHeight) => {
        const property = {
            "x": Math.random() * window.innerHeight,
            "y": Math.random() * window.innerHeight,
            "width": parseInt(p5.random(minWidth, maxWidth)),
            "height": parseInt(p5.random(minHeight, maxHeight)),
            "orientation": Math.random() < 0.5
        }
        return property
    }

    const blockPoints = (p) => {
        const poly = []
        poly[0] = p5.createVector(
            p.x,
            p.y
        )
        poly[1] = p5.createVector(
            p.orientation ? p.x + p.width : p.x + p.height,
            p.y
        )
        poly[2] = p5.createVector(
            p.orientation ? p.x + p.width : p.x + p.height,
            p.orientation ? p.y + p.height : p.y + p.width
        )
        poly[3] = p5.createVector(
            p.x,
            p.orientation ? p.y + p.height : p.y + p.width
        )

        return poly
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(255)
        p5.collideDebug(true)
        p5.noStroke();

        for (let c = 0; c < palette.colors.length; c++) {
            builds[c] = []
        }
    }

    p5.draw = () => {
        p5.push()
        p5.translate(window.innerWidth / 2, -window.innerHeight / 0.9)
        p5.rotate(p5.QUARTER_PI)
        p5.scale(2)
        if (p5.frameCount % 16 == 0) p5.computeRoad()
        if (p5.frameCount % 8 == 0) p5.computeBuilding()
        p5.pop()
    }

    p5.computeRoad = () => {
        p5.fill(0)
        const roadProperty = blockProperty(
            window.innerWidth / 6,
            window.innerWidth,
            2,
            4
        )
        const road = blockPoints(roadProperty);
        roads.push(road)
        p5.beginShape()
        for (let p = 0; p < road.length; p++) {
            p5.vertex(road[p].x, road[p].y)
        }
        p5.endShape(p5.CLOSE)

    }

    p5.computeBuilding = () => {
        const colorID = p5.int(palette.colors.length * p5.random(1))
        p5.fill(palette.colors[colorID])

        const buildingProperty = blockProperty(8, 32, 2, 12)
        const build = blockPoints(buildingProperty);
        builds[colorID].push(build)

        p5.beginShape()
        for (let p = 0; p < build.length; p++) {
            p5.vertex(build[p].x, build[p].y)
        }
        p5.endShape(p5.CLOSE)
    }

}
////////////////////////////////////////////////////
const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
////////////////////////////////////////////////////