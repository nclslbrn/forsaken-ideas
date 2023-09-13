import ease from '../../sketch-common/ease'
import Pool from '../../sketch-common/Pool'
import * as tome from 'chromotome'

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
        w: side > 1000 ? 1000 : side * 0.85,
        h: side > 1000 ? 1000 : side * 0.85
    }
}
/*
const gifOptions = {
    quality: 8,
    render: false,
    download: true,
    fileName: 'zone-occupancy.gif'
}
let firstRowsItems, firstCols,
let nLoop = 1
*/
let rows, cols, palette, canvas
const maxItems = 32
const zoneOccupancy = (p5) => {
    zoneOccupancy.init = function () {
        // nLoop = 1
        rows = { current: new Pool(maxItems), next: new Pool(maxItems) }
        rows.current.update()
        rows.next.update()
        cols = []
        for (let y = 0; y < maxItems; y++) {
            cols.push({ current: new Pool(maxItems), next: new Pool(maxItems) })
            cols[y].current.update()
            cols[y].next.update()
        }
        // firstRowsItems = [...rows.current.items]
        // firstCols = [...cols]
        palette = tome.get()
    }
    zoneOccupancy.download_JPG = function () {
        p5.saveCanvas(canvas, 'zone-occupancy', 'jpg')
    }
    p5.setup = function () {
        const canvasSize = sketchSize()
        canvas = p5.createCanvas(canvasSize.w, canvasSize.h)
        canvas.elt.style.aspectRatio = '1 / 1'
        //p5.frameRate(framesPerSecond)
        p5.stroke("#00000000")
        /*
        if (isRecording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: numFrame / framesPerSecond,
                framesPerSecond: framesPerSecond
            })
        }
        */
        
        p5.background(255)
        zoneOccupancy.init()
    }

    p5.draw = function () {
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
            nLoop++
            */
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
                                p5.fill(palette.background || '#f3f3f3')
                            } else {
                                p5.fill(palette.colors[(i + j) % 2] || '#444')
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
