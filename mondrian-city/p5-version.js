"use strict"

import style from '../src/sass/project.scss'
import p5 from 'p5'
import p5Collide2D from '../tools/p5.collide2D/p5.collide2d.min'

/*
import * as tome from 'chromotome';
const palette = tome.get('tsu_arcade');
*/
const palette = {
    colors: ['#F60201', '#FDED01', '#1F7FC9'],
    background: '#999999'
}

let isSaving = false
let roads = []
let builds = []
////////////////////////////////////////////////////
const containerElement = document.body
const loader = document.getElementById('p5_loading')
////////////////////////////////////////////////////
const sketch = (p5) => {


    const maxRoad = 52
    const blockProperty = (minWidth, maxWidth, minHeight, maxHeight) => {
        const property = {
            "x": p5.random(2) * window.innerHeight,
            "y": p5.random(2) * window.innerHeight,
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


        const radius = p5.sqrt(p5.sq(p.width) + p5.sq(p.height))

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

            rotatePoly[polyId] = p5.createVector(
                poly[polyId].x - (p.direction ? p.width / 2 : p.height / 2),
                poly[polyId].y - (p.direction ? -p.height / 2 : p.width / 2)
            )

            if (p.orientation) {
                rotatePoly[polyId].rotate(315)
            } else {
                rotatePoly[polyId].rotate(-45)
            }

        }
        return rotatePoly
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.angleMode(p5.DEGREES)
        p5.background(255, 248, 250)
        p5.noStroke()
        p5.collideDebug(true)

        for (let c = 0; c < palette.colors.length; c++) {
            builds[c] = []
        }
    }

    p5.draw = () => {
        //p5.push()
        p5.translate(-window.innerHeight * 0.5, window.innerHeight * 0.5)
        //p5.scale(0.5)
        if (!isSaving) { //&& p5.frameCount % 8 == 0) {
            if (roads.length < maxRoad) {
                p5.computeRoad()
            }
            if (roads.length == maxRoad) {
                p5.computeBuilding()
            }
        }


        //p5.pop()
    }

    p5.computeRoad = () => {
        p5.fill(palette.background)
        const roadProperty = blockProperty(
            window.innerHeight,
            window.innerHeight / 2,
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

        const buildingProperty = blockProperty(12, 64, 4, 32)
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

    p5.mousePressed = () => {
        /* TODO: compute from builds and roads as SVG with paper.js or d3.js
        //if (window.confirm('Would you like to download this drawing as SVG files ?')) {
        isSaving = true
        const date = new Date;
        const fileName = 'Mondrian-City.' + date.getFullYear() + '-' + date.getMonth() + '-' +
            date.getDay() + '_' + date.getHours() + '.' + date.getMinutes() + '.' +
            date.getSeconds() + '--copyright_Nicolas_Lebrun_CC-by-3.0'
        isSaving = false
        //}
        */
        //console.table(roads, Object.keys(roads))
        // roads.map(road => console.table(road, ["x", "y"]))


        //        console.log(JSON.stringify(roads))
        //        console.log(JSON.stringify(builds))
    }

}
////////////////////////////////////////////////////
let P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

var resizeTimeout;
window.addEventListener('resize', function(event) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        containerElement.removeChild(containerElement.getElementsByClassName('p5Canvas')[0])
        let P5 = new p5(sketch, containerElement)
    }, 500);
});
////////////////////////////////////////////////////