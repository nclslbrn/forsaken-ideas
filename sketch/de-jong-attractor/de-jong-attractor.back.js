import strangeAttractors from '../../sketch-common/strange-attractors'
import Notification from '../../sketch-common/Notification'

const sketch = (p5) => {
    const res = 4
    const maxBounce = 1 + Math.floor(Math.random() * 3)
    const initPoints = []

    let points = []
    let pointsHistory = []
    let canvas
    const scale = Math.random() * 7 - 3.5
    const strokeColor = p5.color(0, 25)
    const width = window.innerWidth * 0.75
    const height = window.innerHeight * 0.75
    const margin = Math.max(width, height) / 48
    const deJongAttractor = strangeAttractors().attractors['de_jong']

    p5.setup = () => {
        p5.createCanvas(width, height)
        p5.stroke(strokeColor)

        for (let x = margin; x < width - margin; x += res) {
            initPoints.push({
                x: x,
                y: height / 2,
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
                const v = deJongAttractor({ x: x, y: y })
                const angle = Math.atan2(v.x * x, v.y * y) * scale
                points[p].vx = 3.5 * Math.cos(angle)
                points[p].vy = 3.5 * Math.sin(angle)

                p5.line(
                    points[p].x,
                    points[p].y,
                    points[p].x + points[p].vx,
                    points[p].y + points[p].vy
                )

                if (points[p].x > width - margin || points[p].x < margin) {
                    points[p].vx *= -1
                    points[p].bounce += 1
                }
                if (points[p].y > height - margin || points[p].y < margin) {
                    points[p].vy *= -1
                    points[p].bounce += 1
                }
                pointsHistory[p].push({
                    x: points[p].x,
                    y: points[p].y
                })
                points[p].x += points[p].vx
                points[p].y += points[p].vy
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
        strangeAttractors(p5).init('de_jong')
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
        return {
            points: pointsHistory,
            width: width,
            height: height
        }
    }
}

export default sketch
