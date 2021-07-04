import Walker from './walker'
import randomFromCircle from './randomFromCircle'

const sketch = (p5) => {
    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: 1200, //side > 800 ? 800 : side * 0.85,
            h: 630 //side > 800 ? 800 : side * 0.85
        }
    }

    const walkerNum = 1200,
        iteration = 12,
        stickiness = 0.3,
        walkerSpeed = 4,
        strokeWidth = {
            min: 0.5,
            max: 5
        },
        sketchDim = sketchSize()
    const center = { x: sketchDim.w / 2, y: sketchDim.h / 2 }
    const margin = p5.round(sketchDim.w / 24)
    const initBranchSize = sketchDim.h / 48

    let canvas = false,
        isTreeFinished = false,
        radius = 120,
        branchSize = initBranchSize,
        walkers = [],
        tree = [],
        lines = []

    p5.setup = () => {
        canvas = p5.createCanvas(sketchDim.w, sketchDim.h)
        p5.fill(0)
        p5.strokeWeight(0.5)
        p5.textSize(16)
        p5.textAlign(p5.CENTER, p5.CENTER)
        init()
    }

    sketch.init = () => {
        isTreeFinished = false
        walkers = []
        tree = []
        lines = []
        tree[0] = new Walker(
            sketchDim.w / 2,
            sketchDim.h / 2,
            true,
            0,
            walkerSpeed
        )
        branchSize = initBranchSize
        for (let w = 0; w < walkerNum; w++) {
            const walkerPos = randomFromCircle({
                center: center,
                radius: radius
            })
            walkers[w] = new Walker(
                walkerPos.x,
                walkerPos.y,
                false,
                0,
                walkerSpeed
            )
        }
        p5.redraw()
    }

    sketch.processTree = () => {
        for (let w = 0; w < walkerNum; w++) {
            if (walkers[w] != undefined) {
                for (let move = 0; move < iteration; move++) {
                    walkers[w].walk()
                    //p5.point(walkers[w].x, walkers[w].y) // debug purpose

                    if (
                        walkers[w].x < margin ||
                        walkers[w].x > sketchDim.w - margin ||
                        walkers[w].y < margin ||
                        walkers[w].y > sketchDim.h - margin
                    ) {
                        const randPosition = randomFromCircle({
                            center: center,
                            radius: radius
                        })
                        walkers[w].x = randPosition.x
                        walkers[w].y = randPosition.y
                    }
                    for (let t = 0; t < tree.length; t++) {
                        if (
                            walkers[w].distance(tree[t]) <
                                Math.pow(branchSize, 2) &&
                            Math.random() > stickiness
                        ) {
                            lines.push({
                                x1: walkers[w].x,
                                y1: walkers[w].y,
                                x2: tree[t].x,
                                y2: tree[t].y
                            })

                            walkers[w].stop = true
                            p5.append(tree, walkers[w])
                            walkers.splice(w, 1)
                            radius += 0.25

                            if (branchSize > walkerSpeed * 2) {
                                branchSize *= 0.995
                            }

                            const randPosition = randomFromCircle({
                                center: center,
                                radius: radius
                            })
                            walkers[walkers.length] = new Walker(
                                randPosition.x,
                                randPosition.y,
                                false,
                                0,
                                walkerSpeed
                            )
                        }
                    }
                }
            }
        }
    }
    p5.draw = () => {
        if (!isTreeFinished) {
            p5.background(255)
            sketch.processTree()
        }
        if (lines.length == 0) {
            p5.textAlign(p5.CENTER, p5.CENTER)
            p5.text(
                "Walkers don't yet hit the first cluster.",
                p5.width / 2,
                p5.height / 2
            )
        }
        for (let i = 0; i < lines.length && !isTreeFinished; i++) {
            if (
                lines[i].x1 <= margin ||
                lines[i].y1 <= margin ||
                lines[i].x2 <= margin ||
                lines[i].y2 <= margin ||
                lines[i].x1 >= sketchDim.w - margin ||
                lines[i].y1 >= sketchDim.h - margin ||
                lines[i].x2 >= sketchDim.w - margin ||
                lines[i].y2 >= sketchDim.h - margin
            ) {
                console.log('Done !')
                isTreeFinished = true
            } else {
                const strokeWeight = p5.map(
                    i,
                    0,
                    lines.length,
                    strokeWidth.max,
                    strokeWidth.min
                )
                if (lines.length > 12) {
                    p5.strokeWeight(strokeWeight)
                }
                p5.line(lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2)
            }
        }
    }

    sketch.getSketchProperties = () => {
        return {
            lines: lines,
            width: sketchDim.w,
            height: sketchDim.h,
            strokeWidth: strokeWidth
        }
    }
    sketch.downloadJPG = () => {
        p5.saveCanvas(canvas, 'capture', 'jpg')
    }
    sketch.exportPNG = () => {
        const date = new Date()
        const filename =
            'Diffusion-limited-aggregation.' +
            date.getFullYear() +
            '-' +
            date.getMonth() +
            '-' +
            date.getDay() +
            '_' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.saveCanvas(cacheCanvas, filename, 'png')
    }
}

export default sketch
