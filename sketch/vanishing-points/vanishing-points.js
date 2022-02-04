import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import { randomFloatBteween } from '../../src/js/sketch-common/rand-between'
const angleFromTo = (from, to) => {
    return Math.atan2(to.y - from.y, to.x - from.x)
}
const svg = new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'P24x32'
})
const sketch = {
    N: 200,
    vPoint: { x1: null, x2: null, y: null },
    margin: svg.cmToPixels(2),
    colorGroups: ['black', 'white'],
    // setup
    launch: () => {
        svg.init()
        sketch.colorGroups.forEach((c) =>
            svg.group({
                name: c,
                stroke: c,
                fill: 'none'
            })
        )

        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clearGroups()
        //sketch.colorGroups = shuffle(sketch.colorGroups)
        sketch.vPoint.x1 = -svg.width * Math.random()
        sketch.vPoint.x2 = svg.width + svg.width * Math.random()
        sketch.vPoint.y = svg.height * 0.75 - svg.height * Math.random() * 0.5
        svg.rect({
            x: sketch.margin,
            y: sketch.margin,
            w: svg.width - sketch.margin * 2,
            h: sketch.vPoint.y - sketch.margin,
            group: sketch.colorGroups[0],
            fill: sketch.colorGroups[1]
        })
        svg.rect({
            x: sketch.margin,
            y: sketch.vPoint.y,
            w: svg.width - sketch.margin * 2,
            h: svg.height - sketch.vPoint.y - sketch.margin,
            group: sketch.colorGroups[1],
            fill: sketch.colorGroups[0],
            stroke: sketch.colorGroups[0]
        })

        for (let i = 0; i < sketch.N; i++) {
            const rPos = {
                x: svg.width * 0.5 + (Math.random() - 0.5) * svg.width * 0.65,
                y: svg.height * 0.5 + (Math.random() - 0.5) * svg.height * 0.65
            }
            const lineWidth = [
                svg.width * randomFloatBteween(0.005, 0.09),
                svg.width * randomFloatBteween(0.005, 0.09)
            ]
            const angle = [
                angleFromTo(rPos, { x: sketch.vPoint.x1, y: sketch.vPoint.y }),
                angleFromTo(rPos, { x: sketch.vPoint.x2, y: sketch.vPoint.y })
            ]
            const leftPoint = {
                x: rPos.x + lineWidth[0] * Math.cos(angle[0]),
                y: rPos.y + lineWidth[0] * Math.sin(angle[0])
            }
            const rightPoint = {
                x: rPos.x + lineWidth[1] * Math.cos(angle[1]),
                y: rPos.y + lineWidth[1] * Math.sin(angle[1])
            }
            const backpointAngle = [
                angleFromTo(rightPoint, {
                    x: sketch.vPoint.x1,
                    y: sketch.vPoint.y
                }),
                angleFromTo(leftPoint, {
                    x: sketch.vPoint.x2,
                    y: sketch.vPoint.y
                })
            ]

            const backPoint = {
                x:
                    rightPoint.x +
                    lineWidth[0] * 0.95 * Math.cos(backpointAngle[0]),
                y:
                    rightPoint.y +
                    lineWidth[0] * 0.95 * Math.sin(backpointAngle[0])
            }
            const pts = []
            Array(leftPoint, rPos, rightPoint, backPoint).forEach((point) =>
                pts.push([point.x, point.y])
            )
            const colId = backPoint.y < sketch.vPoint.y ? 0 : 1
            svg.path({
                points: pts,
                close: true,
                group: sketch.colorGroups[colId],
                stroke: sketch.colorGroups[colId],
                fill: 'none'
            })
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'vanishing-points' })
    }
}

export default sketch
