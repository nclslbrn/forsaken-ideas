import strangeAttractors from '../../src/js/sketch-common/strange-attractors'

const sketch = (p5) => {
    const res = 4
    const initPoints = []
    let points = []
    let pointsHistory = []
    let newLineCrossRef = []
    let canvas
    const strokeColor = p5.color(0, 25)
    const width = window.innerWidth * 0.75
    const height = window.innerHeight * 0.75
    const scale = 0.01
    const margin = window.innerWidth / 56
    const deJongAttractor = strangeAttractors(p5).attractors['de_jong']

    p5.setup = () => {
        p5.createCanvas(width, height)
        p5.stroke(strokeColor)

        for (let x = margin; x < width - margin; x += res) {
            initPoints.push({
                x: x,
                y: margin,
                vx: 0,
                vy: 5
            })
            pointsHistory.push([])
        }
        sketch.init()
    }
    p5.draw = () => {
        for (let p = 0; p < points.length; p++) {
            const x = (points[p].x - width / 2) * scale
            const y = (points[p].y - width / 2) * scale
            const v = deJongAttractor(p5.createVector(x, y))
            const angle = Math.atan2(v.x - x, v.y - y) * 0.5
            points[p].vx += Math.cos(angle) * 0.01
            points[p].vy += Math.sin(angle) * 0.01

            p5.line(
                points[p].x,
                points[p].y,
                points[p].x + points[p].vx,
                points[p].y + points[p].vy
            )

            if (
                points[p].x + points[p].vx > width - margin ||
                points[p].y + points[p].vy > height - margin ||
                points[p].x + points[p].vx < margin ||
                points[p].y + points[p].vy < margin
            ) {
                newLineCrossRef[p] = pointsHistory.length
                pointsHistory[pointsHistory.length] = []
            } else {
                if (typeof newLineCrossRef[p] != 'undefined') {
                    pointsHistory[newLineCrossRef[p]].push({
                        x: points[p].x,
                        y: points[p].y
                    })
                } else {
                    pointsHistory[p].push({
                        x: points[p].x,
                        y: points[p].y
                    })
                }
            }
            points[p].x += points[p].vx
            points[p].y += points[p].vy

            points[p].vx *= 0.99
            points[p].vy *= 0.99

            if (points[p].x > width - margin) points[p].x = margin
            if (points[p].y > height - margin) points[p].y = margin
            if (points[p].x < margin) points[p].x = width - margin
            if (points[p].y < margin) points[p].y = height - margin
        }
    }
    sketch.init = () => {
        strangeAttractors(p5).init('de_jong')

        points = initPoints.map((p) => ({
            ...p
        }))
        p5.background(255, 250, 245)
    }
    sketch.downloadJPG = () => {
        p5.saveCanvas(canvas, 'capture', 'jpg')
    }
    sketch.getSketchProperties = () => {
        p5.noLoop()
        return {
            points: pointsHistory,
            width: width,
            height: height
        }
    }
}

export default sketch
