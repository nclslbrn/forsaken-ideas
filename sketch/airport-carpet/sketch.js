/// <reference path="../node_modules/@types/p5/global.d.ts" />
const margin = 40,
    yRange = new Range(8),
    size = 1000,
    inner = size - margin * 2

let dy = margin,
    palette = getPalette(-1)

function setup() {
    createCanvas(size, size)
    shuffle(palette, true)
    background(245)

    for (let i = 0; i < yRange.items.length; i++) {
        const xRange = new Range(5)
        const y = yRange.items[i] * inner
        let dx = margin

        for (let j = 0; j < xRange.items.length; j++) {
            const x = xRange.items[j] * inner
            noStroke()
            fill(random(palette))
            rect(dx, dy, x, y)
            const randColor = random(palette)
            const step = random([2, 3, 4, 5])
            strokeWeight(step / 2)
            for (let _y = 0; _y <= y; _y += step) {
                sandLine(
                    { x: dx, y: dy + _y },
                    { x: dx + x, y: dy + _y },
                    randColor
                )
            }

            dx += x
        }
        dy += y
    }
}

function draw() {}
