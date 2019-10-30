"use strict"

import style from '../src/sass/project.scss'
import p5 from 'p5'

import p5Collide2D from '../tools/p5.collide2D/p5.collide2d.min'
import * as tome from 'chromotome';
const palette = tome.get('tundra2');

////////////////////////////////////////////////////
const containerElement = document.body
const loader = document.getElementById('p5_loading')
////////////////////////////////////////////////////
const sketch = (p5) => {

    const roads = []
    const builds = []
    const maxRoad = 32
    const blockProperty = (minWidth, maxWidth, minHeight, maxHeight) => {
        const property = {
            "x": Math.random() * window.innerWidth,
            "y": Math.random() * window.innerHeight,
            "width": parseInt(p5.random(minWidth, maxWidth)),
            "height": parseInt(p5.random(minHeight, maxHeight)),
            "orientation": Math.random() < 0.5
        }
        return property
    }

    const blockPoints = (p) => {
        let poly = []
        let centerPoly = []
        let rotatePoly = []


        const radius = p5.sqrt(p5.sq(p.width / 2) + p5.sq(p.height / 2))
        //console.log(p.width / 2 + " + " + p.height / 2 + " = " + radius)

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

        for (let polyId = 0; polyId < poly.length; polyId++) {
            //center rect

            const xRot = 0
            const yRot = 0

            if (polyId <= 1) {
                xRot = p.orientation ? p5.cos(p5.QUARTER_PI) : p5.cos(-p5.QUARTER_PI)
                yRot = p.orientation ? p5.sin(p5.QUATER_PI) : p5.sin(-p5.QUARTER_PI)

            } else {
                xRot = p.orientation ? p5.cos(p5.TWO_PI + p5.QUARTER_PI) : p5.cos(p5.TWO_PI - p5.QUARTER_PI)
                yRot = p.orientation ? p5.sin(p5.TWO_PI + p5.QUATER_PI) : p5.sin(p5.TWO_PI - p5.QUARTER_PI)
            }
            rotatePoly[polyId] = p5.createVector(
                (p.direction ? poly[polyId].x - p.width / 2 : poly[polyId].x - p.height / 2) + radius * xRot,
                (p.direction ? poly[polyId].y - p.height / 2 : poly[polyId].y - p.width / 2) + radius * yRot
            )
        }
        return rotatePoly
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.angleMode(p5.DEGREES)
        p5.background(255)
        p5.collideDebug(true)

        for (let c = 0; c < palette.colors.length; c++) {
            builds[c] = []
        }
    }

    p5.draw = () => {
        //p5.push()
        //p5.translate(window.innerWidth / 2, -window.innerHeight / 0.9)
        //p5.rotate(p5.QUARTER_PI)
        //p5.scale(2)
        if (roads.length < maxRoad) {
            p5.computeRoad()
        }
        if (roads.length == maxRoad) {
            p5.computeBuilding()
        }
        //p5.pop()
    }

    p5.computeRoad = () => {
        p5.fill(0)
        p5.noStroke();
        const roadProperty = blockProperty(
            window.innerWidth / 6,
            window.innerWidth,
            2,
            6
        )
        const road = blockPoints(roadProperty);
        p5.beginShape()
        for (let p = 0; p < road.length; p++) {
            p5.vertex(road[p].x, road[p].y)
        }
        p5.endShape(p5.CLOSE)
        roads.push(road)

    }

    p5.computeBuilding = () => {
        const colorID = p5.int(palette.colors.length * p5.random(1))
        p5.fill(palette.colors[colorID])
        p5.stroke(255);

        const buildingProperty = blockProperty(8, 32, 2, 12)
        let isHoverRoads = false
        let isHoverBuildings = false
        const build = blockPoints(buildingProperty);

        for (let r = 0; r < roads.length; r++) {
            if (p5.collidePolyPoly(roads[r], build)) {
                isHoverRoads = true
            }
        }
        for (let c = 0; c < builds.length; c++) {
            for (let b = 0; b < builds[c].length; b++) {
                if (p5.collidePolyPoly(builds[c][b], build)) {
                    isHoverBuildings = true
                }
            }
        }
        if (!isHoverRoads && !isHoverBuildings) {

            builds[colorID].push(build)

            p5.beginShape()
            for (let p = 0; p < build.length; p++) {
                p5.vertex(build[p].x, build[p].y)
            }
            p5.endShape(p5.CLOSE)
        }
    }

}
////////////////////////////////////////////////////
const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
////////////////////////////////////////////////////