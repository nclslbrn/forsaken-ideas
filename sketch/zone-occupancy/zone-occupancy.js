import ease from '../../src/js/sketch-common/ease'
import Pool from '../../src/js/sketch-common/Pool'
import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'

const numLoop = 12
const numFrame = 60
const framesPerLoop = numFrame / numLoop
const isRecording = true
const framesPerSecond = 12
const sketchSize = () => {
    const side = Math.min(window.innerWidth, window.innerHeight)
    return {
        w: side > 800 ? 800 : side * 0.85,
        h: side > 800 ? 800 : side * 0.85
    }
}
const gifOptions = {
    quality: 8,
    render: false,
    download: true,
    fileName: 'zone-occupancy.gif'
}

const zoneOccupancy = (p5) => {
    let rows, cols, colors, firstRowsItems, firstCols
    const maxItems = 16
    let nLoop = 0
    p5.setup = () => {
        const canvasSize = sketchSize()
        p5.createCanvas(canvasSize.w, canvasSize.h)
        p5.frameRate(framesPerSecond)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        p5.noStroke()
        p5.randomSeed(99)

        if (isRecording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: numFrame / framesPerSecond,
                framesPerSecond: framesPerSecond
            })
        }

        rows = { current: new Pool(maxItems), next: new Pool(maxItems) }
        rows.current.update()
        rows.next.update()
        cols = []
        for (let y = 0; y < maxItems; y++) {
            cols.push({ current: new Pool(maxItems), next: new Pool(maxItems) })
            cols[y].current.update()
            cols[y].next.update()
        }
        firstRowsItems = [...rows.current.items]
        firstCols = [...cols]
        colors = generateHslaColors(80, 50, 100, 2).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
    }

    p5.draw = () => {
        if (p5.frameCount % framesPerLoop === 0) {
            nLoop++
            rows.current.items = [...rows.next.items]
            rows.next.update()
            const tempNext = [...cols]

            for (let col = 0; col < maxItems; col++) {
                cols[col].current.items = [...tempNext[col].next.items]
                cols[col].next.update()
            }
            // last loop
            if (p5.frameCount / framesPerLoop === numLoop) {
                rows.next.items = firstRowsItems
                for (let col = 0; col < maxItems; col++) {
                    cols[col].next.items = [...firstCols[col].current.items]
                }
            }
            if (nLoop === numLoop + 1) {
                p5.noLoop()
            }
        } else {
            p5.background(255)

            const t = ease((p5.frameCount % framesPerLoop) / framesPerLoop, 2)
            let y = p5.height * 0.05
            const currentRows = rows.current.getItems()
            const nextRows = rows.next.getItems()

            for (let i = 0; i < maxItems; i++) {
                if (currentRows[i] && nextRows[i]) {
                    const dy =
                        p5.lerp(currentRows[i], nextRows[i], t) *
                        p5.height *
                        0.45
                    const currentCols = cols[i].current.getItems()
                    const nextCols = cols[i].next.getItems()
                    let x = p5.width * 0.05

                    for (let j = 0; j < maxItems; j++) {
                        if (currentCols[j] && nextCols[j]) {
                            const dx =
                                p5.lerp(currentCols[j], nextCols[j], t) *
                                p5.width *
                                0.45

                            p5.fill(colors[(i + j) % 2 === 0 ? 0 : 1])
                            p5.rect(x, y, dx, dy)
                            p5.rect(p5.width - x, y, -dx, dy)
                            p5.rect(x, p5.height - y, dx, -dy)
                            p5.rect(p5.width - x, p5.height - y, -dx, -dy)

                            x += dx
                        }
                    }
                    y += dy
                }
            }
            // p5.fill(0, 0, 0, 100)
            // p5.text(nLoop + ' / ' + numLoop, 16, 16)
        }
    }
}

export default zoneOccupancy
