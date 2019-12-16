import { newExpression } from "babel-types"
import Walker from "./walker"

const sketch = p5 => {
    const sketchWidth = window.innerWidth * 0.8
    const sketchHeight = window.innerHeight * 0.9

    let isTreeFinished = false
    const walkerNum = 320
    const iteration = 12
    const stickiness = 0.4
    const walkerSpeed = 4
    const strokeWidth = {
        min: 0.5,
        max: 5
    }
    const initBranchSize = sketchWidth / 64
    let branchSize = initBranchSize
    let initPos = []
    let walkers = []
    let tree = []
    let lines = []
    const xMargin = p5.round(sketchWidth / 24)
    const yMargin = p5.round(sketchHeight / 24)

    const randPos = () => {
        const randSide = Math.round(Math.random() * 3)
        switch (randSide) {
            case 0:
                return {
                    x: xMargin + Math.random() * sketchWidth - xMargin,
                    y: yMargin
                }
                break
            case 1:
                return {
                    x: xMargin + Math.random() * sketchWidth - xMargin,
                    y: sketchHeight - yMargin
                }
                break
            case 2:
                return {
                    x: xMargin,
                    y: yMargin + Math.random() * sketchWidth - yMargin
                }
                break
            case 3:
                return {
                    x: sketchWidth - xMargin,
                    y: yMargin + Math.random() * sketchWidth - yMargin
                }
                break
        }
    }

    const processTree = () => {
        for (let w = 0; w < walkerNum; w++) {
            if (walkers[w] != undefined) {
                for (let move = 0; move < iteration; move++) {
                    walkers[w].walk()
                    p5.point(walkers[w].x, walkers[w].y) // debug purpose

                    if (
                        walkers[w].x < xMargin ||
                        walkers[w].x > sketchWidth - xMargin ||
                        walkers[w].y < yMargin ||
                        walkers[w].y > sketchHeight - yMargin
                    ) {
                        const randPosition = randPos()
                        walkers[w].x = randPosition.x
                        walkers[w].y = randPosition.y
                    }
                    for (let t = 0; t < tree.length; t++) {
                        if (
                            walkers[w].distance(tree[t]) <
                                Math.pow(branchSize, 2) &&
                            p5.random(1) > stickiness
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

                            if (branchSize > walkerSpeed * 2) {
                                branchSize *= 0.995
                            }

                            const randPosition = randPos()
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

    p5.setup = () => {
        p5.createCanvas(sketchWidth, sketchHeight)
        p5.fill(0)
        p5.strokeWeight(0.5)
        init()
    }

    sketch.init = () => {
        isTreeFinished = false
        walkers = []
        tree = []
        lines = []
        tree[0] = new Walker(
            sketchWidth / 2,
            sketchHeight / 2,
            true,
            0,
            walkerSpeed
        )
        branchSize = initBranchSize
        for (let w = 0; w < walkerNum; w++) {
            const walkerPos = randPos()
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

    p5.draw = () => {
        if (!isTreeFinished) {
            p5.background(255)
            processTree()
        }

        for (let i = 0; i < lines.length && !isTreeFinished; i++) {
            if (
                lines[i].x1 <= xMargin ||
                lines[i].y1 <= yMargin ||
                lines[i].x2 <= xMargin ||
                lines[i].y2 <= yMargin ||
                lines[i].x1 >= sketchWidth - xMargin ||
                lines[i].y1 >= sketchHeight - yMargin ||
                lines[i].x2 >= sketchWidth - xMargin ||
                lines[i].y2 >= sketchHeight - yMargin
            ) {
                console.log("Finished")
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
            width: sketchWidth,
            height: sketchHeight,
            strokeWidth: strokeWidth
        }
    }
    sketch.exportPNG = () => {
        const date = new Date()
        const filename =
            "Diffusion-limited-aggregation." +
            date.getFullYear() +
            "-" +
            date.getMonth() +
            "-" +
            date.getDay() +
            "_" +
            date.getHours() +
            "." +
            date.getMinutes() +
            "." +
            date.getSeconds() +
            "--copyright_Nicolas_Lebrun_CC-by-3.0"
        p5.saveCanvas(cacheCanvas, filename, "png")
    }
}

export default sketch
