const sketch = (p5) => {

    const res = 5

    let a = Math.random() * 4 - 2,
        b = Math.random() * 4 - 2,
        c = Math.random() * 4 - 2,
        d = Math.random() * 4 - 2

    const initPoints = []
    let points = []
    const width = window.innerWidth * 0.75
    const height = window.innerHeight * 0.75

    p5.setup = () => {
        p5.createCanvas(width, height)
        p5.stroke(0, 25)

        for (let x = 0; x < width; x += res) {
            initPoints.push({
                "x": x,
                "y": 0,
                "vx": 0,
                "vy": 0
            })
        }
        sketch.init()
    }
    p5.draw = () => {

        for (let p = 0; p < points.length; p++) {

            const angle = cliffordAttractor(points[p].x, points[p].y)

            points[p].vx += Math.cos(angle) * 0.3
            points[p].vy += Math.sin(angle) * 0.3

            p5.line(points[p].x, points[p].y, points[p].x + points[p].vx, points[p].y + points[p].vy)

            points[p].x += points[p].vx
            points[p].y += points[p].vy
            // TODO: Save for each point every positon to be exported as path(d="...") by svg.js

            points[p].vx *= 0.99
            points[p].vy *= 0.99

            if (points[p].x > width) points[p].x = 0;
            if (points[p].y > height) points[p].y = 0;
            if (points[p].x < 0) points[p].x = width;
            if (points[p].y < 0) points[p].y = height;
        }
    }
    sketch.init = () => {

        a = Math.random() * 4 - 2
        b = Math.random() * 4 - 2
        c = Math.random() * 4 - 2
        d = Math.random() * 4 - 2
        points = initPoints.map(p => ({
            ...p
        }))
        p5.background(255)

    }

    const cliffordAttractor = (x, y) => {
        const scale = 0.006
        x = (x - width / 2) * scale
        y = (y - height / 2) * scale
        const x1 = Math.sin(a * y) + c * Math.cos(a * x)
        const y1 = Math.sin(b * x) + d * Math.cos(b * y)

        return Math.atan2(y1 - y, x1 - x)

    }
}

export default sketch