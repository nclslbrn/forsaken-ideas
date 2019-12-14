																																																																																																																																																																																					import { newExpression } from "babel-types"
import Walker from "./walker"

const sketch = p5 => {
    const sketchSize =
        (window.innerWidth > window.innerHeight
            ? window.innerHeight
            : window.innerWidth) * 0.75

    const randPos = () => {
        return initPos[Math.floor(p5.random(1)*initPos.length)];

    }
    let isTreeFinished = false
    const walkerNum = 500
    const iteration = 4
    const stickiness = 0.5
    let walkerSpeed = 64
    let initPos = []
    let walkers = []
    let tree = []
    let lines = []
    const margin = sketchSize / 24

    p5.setup = () => {
        p5.createCanvas(sketchSize, sketchSize)

        for( let tick = margin+4; tick < sketchSize-margin-4; tick++ ) {
            initPos.push({x: tick, y:margin})
            initPos.push({x: tick, y:sketchSize-margin})
            initPos.push({x: margin, y:tick})
            initPos.push({x: sketchSize-margin, y:tick})
        }

        p5.fill(0)
        p5.strokeWeight(0.5)
        init()
    }

    sketch.init = () => {
        isTreeFinished = false
        walkers = []
        tree = []
        lines = []
        tree[0] = new Walker(sketchSize / 2, sketchSize / 2, true, 0, walkerSpeed)
        for (let w = 0; w < walkerNum; w++) {
            const walkerPos = randPos()
            walkers[w] = new Walker(walkerPos.x, walkerPos.y, false, 0, walkerSpeed)
        }
        p5.loop()
        p5.background(255)
        p5.redraw()
    }

    p5.draw = () => {

        if( ! isTreeFinished ) {

            p5.background(255)
            for (let w = 0; w < walkerNum; w++) {

                if (walkers[w] != undefined) {
                    for (let move = 0; move < iteration; move++) {
                        walkers[w].walk()
                        if(
                            walkers[w].x < margin
                            || walkers[w].x > sketchSize-margin
                            || walkers[w].y < margin
                            || walkers[w].y > sketchSize-margin
                        ) {
                            const randPosition = randPos()
                            walkers[w].x = randPosition.x
                            walkers[w].y = randPosition.y
                            //walkers[w].speed += 1
                        }
                    }
                }

                for (let t = 0; t < tree.length; t++) {
                    if (
                        walkers[w].distance(tree[t]) <= walkerSpeed &&
                        p5.random(1) > stickiness
                    ) {
                        lines.push({
                            x1: walkers[w].x, y1: walkers[w].y,
                            x2: tree[t].x, y2: tree[t].y
                        })

                        walkers[w].stop = true
                        p5.append(tree, walkers[w])
                        walkers.splice(w, 1)
                        walkerSpeed += 1
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

                    console.log("DONE");
                    isTreeFinished = true
                    p5.noLoop()
                    break
                    return false
                }
            }
        } 
    }

    sketch.getLines = () => {
        return lines
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
