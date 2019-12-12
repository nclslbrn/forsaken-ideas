import { newExpression } from "babel-types"
import Walker from "./walker"

const sketch = p5 => {
    const sketchSize =
        (window.innerWidth > window.innerHeight
            ? window.innerHeight
            : window.innerWidth) * 0.75

    const randPos = () => {
        return {
            x: p5.round(p5.random(sketchSize)),
            y: p5.round(p5.random(sketchSize))
        }
    }
    const walkerNum = 5000
    const walkerSpeed = 64
    let walkers = []
    let tree = []
    let lines = []
    const margin = sketchSize / 24

    p5.setup = () => {
        p5.createCanvas(sketchSize, sketchSize)
        p5.fill(0)
        p5.strokeWeight(0.5)
        init()
    }
    p5.draw = () => {
        p5.background(255)

        for (let w = 0; w < walkerNum; w++) {
            if (walkers[w] != undefined) {
                //for (let move = 0; move < 6; move++) {
                    walkers[w].walk()
                //}
            }

            for (let t = 0; t < tree.length; t++) {
                if (
                    p5.sq(walkers[w].x - tree[t].x) +
                    p5.sq(walkers[w].y - tree[t].y) <=
                    walkerSpeed
                ) {
                    lines.push({
                        x1: walkers[w].x, y1: walkers[w].y,
                        x2: tree[t].x, y2: tree[t].y
                    })
                   
                    walkers[w].stop = true
                    p5.append(tree, walkers[w])
                    walkers.splice(w, 1)
                    walkers[walkers.length] = new Walker(
                        randPos().x,
                        randPos().y,
                        false,
                        0,
                        walkerSpeed
                    )

                }

            }
        }
        for (let i = 0; i < lines.length; i++) {

            p5.line(lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2);

            if( lines[i].x2 < margin ||
                lines[i].y2 < margin ||
                lines[i].x2 > sketchSize-margin ||
                lines[i].y2 > sketchSize-margin
            ) {
                p5.noLoop()
            }
        }
    }

    sketch.init = () => {
        walkers = []
        tree = []
        lines = []
        p5.loop()
        p5.background(255)
        tree[0] = new Walker(sketchSize / 2, sketchSize / 2, true, 0, walkerSpeed)
        for (let w = 0; w < walkerNum; w++) {
            walkers[w] = new Walker(randPos().x, randPos().y, false, 0, walkerSpeed)
        }
        p5.redraw()
    }
    sketch.exportPNG = () => {
        const date = new Date;
        const filename = 'Diffusion-limited-aggregation.' + date.getFullYear() + '-' + date.getMonth() + '-' +
            date.getDay() + '_' + date.getHours() + '.' + date.getMinutes() + '.' +
            date.getSeconds() + '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.saveCanvas(cacheCanvas, filename, 'png')
    }
}


export default sketch
