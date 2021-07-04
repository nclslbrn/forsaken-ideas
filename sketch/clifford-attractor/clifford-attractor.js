import strangeAttractors from '../../src/js/sketch-common/strange-attractors'

const sketch = (p5) => {
    const res = 8
    const initPoints = []
    let points = []
    let pointsHistory = []
    let newLineCrossRef = []
    let canvas
    const strokeColor = p5.color(0, 25)
    const width = 1200 //window.innerWidth * 0.75
    const height = 630 //window.innerHeight * 0.75
    const scale = 0.01
    const margin = window.innerWidth / 56
    const cliffordAttractor = strangeAttractors(p5).attractors['clifford']

    p5.setup = () => {
        canvas = p5.createCanvas(width, height)
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
            const y = (points[p].y - height / 2) * scale
            const v = cliffordAttractor(p5.createVector(x, y))
            const angle = p5.atan2(v.x - x, v.y - y) * 0.5
            points[p].vx += p5.cos(angle) * 0.01
            points[p].vy += p5.sin(angle) * 0.01

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
        strangeAttractors(p5).init('clifford')
        points = initPoints.map((p) => ({
            ...p
        }))
        pointsHistory = initPoints.map((point) => {
            return []
        })
        p5.background(255, 250, 245)
    }
    sketch.downloadJPG = () => {
        p5.saveCanvas(canvas, 'capture', 'jpg')
    }
    sketch.getSketchProperties = () => {
        p5.noLoop()
        //atttractor['clifford'].init()
        return {
            points: pointsHistory,
            width: width,
            height: height
        }
    }
}

export default sketch
