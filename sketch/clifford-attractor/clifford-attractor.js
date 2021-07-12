import strangeAttractors from '../../src/js/sketch-common/strange-attractors'
import Notification from '../../src/js/sketch-common/Notification'

const sketch = (p5) => {
    const res = 2
    const maxBounce = 2
    const initPoints = []
    const scale = 0.003

    let points = []
    let pointsHistory = []
    let canvas

    const strokeColor = p5.color(0, 25)
    const width = 1200 //window.innerWidth * 0.75
    const height = 630 //window.innerHeight * 0.75
    const cliffordAttractor = strangeAttractors().attractors['clifford']

    p5.setup = () => {
        canvas = p5.createCanvas(width, height)
        p5.stroke(strokeColor)

        for (let x = 0; x < width; x += res) {
            initPoints.push({
                x: x,
                y: 0,
                vx: 0,
                vy: 1,
                bounce: 0
            })
            pointsHistory.push([])
        }
        sketch.init()
    }
    p5.draw = () => {
        if (points.length !== 0) {
            for (let p = 0; p < points.length; p++) {
                const x = points[p].x - width / 2
                const y = points[p].y - height / 2
                const v = cliffordAttractor({ x: x * scale, y: y * scale })
                const angle = Math.atan2(v.x, v.y) * 1.5
                points[p].vx += Math.cos(angle)
                points[p].vy += Math.sin(angle)
                p5.line(
                    points[p].x,
                    points[p].y,
                    points[p].x + points[p].vx,
                    points[p].y + points[p].vy
                )

                if (points[p].x > width || points[p].x < 0) {
                    points[p].vx *= -1
                    points[p].bounce += 1
                }
                if (points[p].y > height || points[p].y < 0) {
                    points[p].vy *= -1
                    points[p].bounce += 1
                }
                pointsHistory[p].push({
                    x: points[p].x,
                    y: points[p].y
                })
                points[p].x += points[p].vx * 0.9
                points[p].y += points[p].vy * 0.9
            }
            points = points.filter((point) => point.bounce < maxBounce)
        } else {
            new Notification(
                'Sketch done !',
                document.getElementById('windowFrame'),
                'light'
            )
            p5.noLoop()
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
