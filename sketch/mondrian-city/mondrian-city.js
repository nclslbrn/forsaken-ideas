const palette = {
    colors: ['#F60201', '#FDED01', '#1F7FC9'],
    background: '#333333'
}
let roads = []
let builds = []

const sketch = (p5) => {
    const maxRoad = 32
    const paperColor = p5.color(255, 248, 250)

    const blockProperty = (minWidth, maxWidth, minHeight, maxHeight) => {
        // global
        const halfWidth = window.innerWidth / 2
        const halfHeight = window.innerHeight / 2

        const property = {
            x: halfWidth + p5.random(-0.25, 0.25) * window.innerWidth,
            y: halfHeight + p5.random(-0.25, 0.25) * window.innerWidth,
            width: parseInt(p5.random(minWidth, maxWidth)),
            height: parseInt(p5.random(minHeight, maxHeight)),
            orientation: Math.random() < 0.5
        }
        return property
    }

    const blockPoints = (p) => {
        let poly = []
        let rotatePoly = []
        // local
        const halfWidth = p.width / 2
        const halfHeight = p.height / 2

        poly[0] = p5.createVector(
            p.orientation ? -halfWidth : -halfHeight,
            p.orientation ? -halfHeight : -halfWidth
        )
        poly[1] = p5.createVector(
            p.orientation ? halfWidth : halfHeight,
            p.orientation ? -halfHeight : -halfWidth
        )
        poly[2] = p5.createVector(
            p.orientation ? halfWidth : halfHeight,
            p.orientation ? halfHeight : halfWidth
        )
        poly[3] = p5.createVector(
            p.orientation ? -halfWidth : -halfHeight,
            p.orientation ? halfHeight : halfWidth
        )

        rotatePoly = poly

        for (let i = 0; i < poly.length; i++) {
            if (p.orientation) {
                rotatePoly[i].rotate(-p5.QUARTER_PI * 3)
            } else {
                rotatePoly[i].rotate(p5.QUARTER_PI)
            }
            rotatePoly[i].x += p.x
            rotatePoly[i].y += p.y
        }
        return rotatePoly
    }
    const init = () => {
        p5.background(paperColor)

        roads.length = 0
        builds.length = 0

        for (let c = 0; c < palette.colors.length; c++) {
            builds[c] = []
        }
    }

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        //p5.angleMode(p5.DEGREES)
        p5.noStroke()
        p5.collideDebug(false)
        init()
    }

    p5.draw = () => {
        p5.push()

        if (roads.length < maxRoad) {
            p5.computeRoad()
        }
        if (roads.length == maxRoad) {
            p5.computeBuilding()
        }
        p5.pop()
    }

    p5.computeRoad = () => {
        p5.fill(palette.background)
        const roadProperty = blockProperty(
            window.innerWidth,
            window.innerWidth,
            2,
            6
        )
        const road = blockPoints(roadProperty)
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
        const build = blockPoints(buildingProperty)

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
    sketch.init = init
    sketch.getCityData = () => {
        return {
            roads: roads,
            builds: builds,
            palette: palette,
            paperColor: paperColor
        }
    }
}
export default sketch
