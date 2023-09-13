const sketch = (p5) => {
    const margin = 0.15,
        num = 800,
        mooves = 50

    let points = [],
        nMoove = 0

    const initPoints = () => {
        const points = []
        const inner = 1 - 2 * margin
        for (let i = 0; i < num; i++) {
            points.push({
                x: p5.width * 0.5 + (Math.random() - 0.5) * p5.width * inner,
                y: p5.height * 0.5 + (Math.random() - 0.5) * p5.height * inner
            })
        }
        return points
    }
    const lineBetweenPoints = () => {
        for (let i = 0; i < points.length; i++) {
            let nearestPoint = false
            let d = 150
            for (let j = 0; j < points.length; j++) {
                const _d = p5.dist(
                    points[i].x,
                    points[i].y,
                    points[j].x,
                    points[j].y
                )
                if (i !== j && _d < d) {
                    d = _d
                    nearestPoint = points[j]
                }
            }
            if (nearestPoint)
                p5.line(
                    points[i].x,
                    points[i].y,
                    nearestPoint.x,
                    nearestPoint.y
                )
        }
    }

    p5.setup = () => {
        p5.createCanvas(800, 800)
        points = initPoints({ w: p5.width, h: p5.height })
        p5.background(255)
    }
    p5.draw = () => {
        if (nMoove == 0) lineBetweenPoints()
        if (nMoove < mooves) {
            for (let i = 0; i < points.length; i++) {
                const n = p5.noise(points[i].x / 300, points[i].y / 300) * 8
                const v = {
                    x: points[i].x + Math.cos(n),
                    y: points[i].y + Math.sin(n)
                }
                points[i].x += Math.cos(n) * 0.5
                points[i].y += Math.sin(n) * 0.5

                p5.line(points[i].x, points[i].y, v.x, v.y)
            }
            nMoove++
        } else {
            lineBetweenPoints()
            p5.noLoop()
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
