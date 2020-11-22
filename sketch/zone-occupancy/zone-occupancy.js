import ease from '../../src/js/sketch-common/ease'
import Pool from '../../src/js/sketch-common/Pool'
import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'

const numLoop = 6
const numFrame = 150
const framesPerLoop = numFrame / numLoop
/*
Remove comment to export GIF
const isRecording = false
const framesPerSecond = 20
*/
const sketchSize = () => {
    const side = Math.min(window.innerWidth, window.innerHeight)
    return {
        w: side > 800 ? 800 : side * 0.85,
        h: side > 800 ? 800 : side * 0.85
    }
}
/*
const gifOptions = {
    quality: 8,
    render: false,
    download: true,
    fileName: 'zone-occupancy.gif'
}
*/
const zoneOccupancy = (p5) => {
    let rows, cols, colors, firstRowsItems, firstCols
    const maxItems = 32
    let nLoop = 1
    p5.setup = () => {
        const canvasSize = sketchSize()
        p5.createCanvas(canvasSize.w, canvasSize.h)
        //p5.frameRate(framesPerSecond)
        p5.stroke(255)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        /*
        if (isRecording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: numFrame / framesPerSecond,
                framesPerSecond: framesPerSecond
            })
        }
        */
        rows = { current: new Pool(maxItems), next: new Pool(maxItems) }
        rows.current.update()
        rows.next.update()
        cols = []
        for (let y = 0; y < maxItems; y++) {
            cols.push({ current: new Pool(maxItems), next: new Pool(maxItems) })
            cols[y].current.update()
            cols[y].next.update()
        }
        firstRowsItems = JSON.parse(JSON.stringify(rows.current.items))
        firstCols = JSON.parse(JSON.stringify(cols))
        colors = generateHslaColors(75, 60, 100, 2).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
        p5.background(255)
    }

    p5.draw = () => {
        if (p5.frameCount % framesPerLoop === 0) {
            rows.current.items = [...rows.next.items]
            rows.next.update()
            const tempNext = [...cols]

            for (let col = 0; col < maxItems; col++) {
                cols[col].current.items = [...tempNext[col].next.items]
                cols[col].next.update()
            }
            /*
            // last loop
            if (nLoop == numLoop - 1) {
                rows.next.items = firstRowsItems
                for (let col = 0; col < maxItems; col++) {
                    cols[col].next.items = [...firstCols[col].current.items]
                }
            }
            if (nLoop === numLoop + 1) {
                p5.noLoop()
            }
            */
            nLoop++
        } else {
            //p5.background(255)

            const t = ease((p5.frameCount % framesPerLoop) / framesPerLoop, 8)
            let y = p5.height * 0.01
            const currentRows = rows.current.getItems()
            const nextRows = rows.next.getItems()

            for (let i = 0; i < maxItems; i++) {
                if (currentRows[i] && nextRows[i]) {
                    const dy =
                        p5.lerp(currentRows[i], nextRows[i], t) *
                        p5.height *
                        0.49
                    const currentCols = cols[i].current.getItems()
                    const nextCols = cols[i].next.getItems()
                    if (dy > 0) {
                        p5.line(p5.width * 0.01, dy, p5.width * 0.99, dy)
                        p5.line(
                            p5.width * 0.01,
                            p5.height - dy,
                            p5.width * 0.99,
                            p5.height - dy
                        )
                    }

                    let x = p5.width * 0.01

                    for (let j = 0; j < maxItems; j++) {
                        if (currentCols[j] && nextCols[j]) {
                            const dx =
                                p5.lerp(currentCols[j], nextCols[j], t) *
                                p5.width *
                                0.49
                            if (i === 0 || j === 0) {
                                p5.fill(0, 0, 100, 100)
                            } else {
                                p5.fill(colors[(i + j) % 2])
                            }
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
        }
    }
}

export default zoneOccupancy
