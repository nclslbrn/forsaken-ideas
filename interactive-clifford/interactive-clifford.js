/**
 * Based on https://editor.p5js.org/ada10086/sketches/HJfXU_j37
 * @param {*} p5
 */

const sketch = p5 => {
    let capture, canvas, prevFrame
    let A,
        B,
        C,
        D = 0
    const threshold = 50
    const scaler = 3
    const captureSize = {
        width: 640,
        height: 480
    }
    const upscaler = {
        x: window.innerWidth / captureSize.width,
        y: window.innerHeight / captureSize.height
    }
    const curveLenght = window.innerHeight / 12

    const cliffordAttractor = (x, y) => {
        // clifford attractor
        // http://paulbourke.net/fractals/clifford/
        const scale = 0.005
        x = (x - window.innerWidth / 2) * scale
        y = (y - window.innerHeight / 2) * scale
        const x1 = Math.sin(A * y) + C * Math.cos(A * x)
        const y1 = Math.sin(B * x) + D * Math.cos(B * y)

        return Math.atan2(y1 - y, x1 - x)
    }

    sketch.init = () => {
        A = Math.random() * 4 - 2
        B = Math.random() * 4 - 2
        C = Math.random() * 4 - 2
        D = Math.random() * 4 - 2
    }

    p5.setup = () => {
        canvas = p5.createCanvas(window.innerWidth, window.innerWidth)
        capture = p5.createCapture(p5.VIDEO)
        capture.size(captureSize.width / scaler, captureSize.height / scaler)
        //capture.hide()

        prevFrame = p5.createImage(
            captureSize.width / scaler,
            captureSize.height / scaler
        )
        sketch.init()
        p5.stroke(255, 0, 0)
    }

    p5.draw = () => {
        p5.background(0)
        capture.loadPixels()
        prevFrame.loadPixels()

        for (let y = 0; y < capture.height; y++) {
            for (let x = 0; x < capture.width; x++) {
                const loc = (x + y * capture.width) * 4

                const r1 = prevFrame.pixels[loc]
                const g1 = prevFrame.pixels[loc + 1]
                const b1 = prevFrame.pixels[loc + 2]
                const bright1 = (r1 + g1 + b1) / 3

                const r2 = capture.pixels[loc]
                const g2 = capture.pixels[loc + 1]
                const b2 = capture.pixels[loc + 2]
                const bright2 = (r2 + b2 + g2) / 3

                const diff = p5.dist(r1, g1, b1, r2, b2, g2)
                const posX = x * (scaler * upscaler.x)
                const posY = y * (scaler * upscaler.y)

                if (diff > threshold) {
                    p5.fill(255, 0, 0)
                    p5.rect(
                        posX,
                        posY,
                        scaler * upscaler.x,
                        scaler * upscaler.y
                    )

                    p5.push()
                    let x = posX
                    let y = posY
                    let vx,
                        vy = 0

                    for (let l = 0; l < 64; l++) {
                        const angle = cliffordAttractor(x, y)

                        vx += Math.cos(angle) * 0.3
                        vy += Math.sin(angle) * 0.3

                        p5.line(x, y, x + vx, y + vy)

                        x += vx
                        y += vy
                        vx *= 0.99
                        vy *= 0.99
                        //console.log(angle)
                    }
                    p5.pop()
                } else {
                    //p5.fill(0)
                }
            }
        }

        p5.updatePixels()

        prevFrame.copy(
            capture,
            0,
            0,
            captureSize.width,
            captureSize.height,
            0,
            0,
            captureSize.width,
            captureSize.height
        )
    }
}
export default sketch
