const { PI, random, round, cos, sin } = Math

const paperTexture = (canvas, c, col) => {
    c.fillStyle = `${col}33`

    for (let i = 0; i < 400; i++) {
        let x = random() * canvas.width,
            y = random() * canvas.height,
            r = random()
        c.beginPath()
        c.ellipse(x, y, r, r, 0, 2 * PI, false)
        c.fill()
    }

    c.strokeStyle = col

    for (let j = 0; j < 3000; j++) {
        const x1 = random() * canvas.width,
            y1 = random() * canvas.height,
            theta = random() * 2 * PI,
            len = 2 + random() * 10,
            x2 = cos(theta) * len + x1,
            y2 = sin(theta) * len + y1
        c.lineWidth = round(1 + random() * 2)
        c.beginPath()
        c.moveTo(x1, y1)
        c.lineTo(x2, y2)
        c.stroke()
    }
}

export { paperTexture }
