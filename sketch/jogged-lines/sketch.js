import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Walker from './Walker'
import Notification from '../../src/js/sketch-common/Notification'
import { randomIntBetween } from './randomBetween'
import { getColorCombination } from '../../src/js/sketch-common/stabilo68-colors'

import LineOffset from './LineOffset'

let notification = false
const container = document.getElementById('windowFrame')
const sketch = {
    svg: new SvgTracer({
        parentElem: container,
        size: 'A3_topSpiralNotebook',
        dpi: 300,
        background: '#000'
    }),
    // setup svg anf its params
    launch: () => {
        sketch.svg.init()
        sketch.margin = {
            x: sketch.svg.cmToPixels(5),
            y: sketch.svg.cmToPixels(5)
        }
        sketch.init()
    },
    init: () => {
        // reset possible previous value
        const movingDiagonally = Math.random() > 0.5
        const innerWidth = sketch.svg.width - sketch.margin.x * 2
        const innerHeight = sketch.svg.height - sketch.margin.y * 2

        sketch.walkers = []
        sketch.offset = movingDiagonally ? 7 : 9
        sketch.cellSize = sketch.svg.cmToPixels(movingDiagonally ? 0.4 : 0.8)
        sketch.walkerNum = 60

        sketch.grid = {
            cols: Math.floor(innerWidth / sketch.cellSize),
            rows: Math.floor(innerHeight / sketch.cellSize)
        }
        sketch.margin.x += (innerWidth % sketch.cellSize) / 2
        sketch.margin.y += (innerHeight % sketch.cellSize) / 2

        sketch.svg.clear()

        sketch.palette = getColorCombination(3)
        sketch.palette.colors.forEach((color, index) =>
            sketch.svg.group({
                name: color.id,
                stroke: color.value,
                fill: 'rgba(0,0,0,0)',
                id: color.id
            })
        )
        if (notification) notification.remove()
        let initializedWalkerNum = 0

        while (initializedWalkerNum < sketch.walkerNum) {
            let slotIsAlreadyTaken = false
            const x =
                2 *
                Math.round(
                    randomIntBetween({ min: 0, max: sketch.grid.cols }) / 2
                )
            const y =
                2 *
                Math.round(
                    randomIntBetween({ min: 0, max: sketch.grid.rows }) / 2
                )

            sketch.walkers.forEach((walker) => {
                if (walker.pos[0] === x && walker.pos[1] === y) {
                    slotIsAlreadyTaken = true
                }
            })
            if (!slotIsAlreadyTaken) {
                sketch.walkers.push(
                    new Walker({
                        pos: [x, y],
                        step: {
                            min: 1,
                            max: 6
                        },
                        maxDirectionTries: 16,
                        limit: [sketch.grid.cols, sketch.grid.rows],
                        movingDiagonally: movingDiagonally
                    })
                )
                initializedWalkerNum++
            }
        }
        sketch.update()
    },
    // reset value and relaunch drawing
    // compute change
    update: () => {
        let stoppedWalkersNum = 0
        for (let w = 0; w < sketch.walkers.length; w++) {
            sketch.walkers[w].walk(sketch.walkers)
            if (sketch.walkers[w].isStuck()) {
                stoppedWalkersNum++
            }
        }

        if (stoppedWalkersNum !== sketch.walkerNum) {
            sketch.draw(false)
            requestAnimationFrame(sketch.update)
        } else {
            sketch.draw(true)
            const penSpecs = sketch.palette.colors.reduce((specs, color) => {
                return specs + `<br> - 88/${color.id} ${color.name}`
            }, '(Stabilo Art markers)')
            notification = new Notification(
                `${sketch.palette.name} palette ${penSpecs}`,
                container,
                'light',
                false
            )
        }
    },
    // Compute offset line and draw them
    draw: (isWalkersStopped = false) => {
        sketch.svg.clearGroups()

        for (let w = 0; w < sketch.walkers.length; w++) {
            const line = sketch.walkers[w].history.map((pos) => [
                sketch.margin.x + pos[0] * sketch.cellSize,
                sketch.margin.y + pos[1] * sketch.cellSize
            ])
            if (line.length > 2) {
                const offset = new LineOffset({
                    line: line,
                    offsetCount: sketch.offset,
                    isDiagComp: sketch.walkers[w].movingDiagonally,
                    offsetWidth:
                        sketch.cellSize *
                        (sketch.walkers[w].movingDiagonally ? 2 : 1.39), // uglly tricks
                    tracer: sketch.svg
                })
                const offsetLines = offset.getOffsets(w)
                offsetLines.lines.forEach((line) =>
                    sketch.svg.path({
                        points: line,
                        group: sketch.palette.colors[offsetLines.color].id,
                        fill: 'none'
                    })
                )
            }
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({
            name: `jogged-lines-${sketch.palette.name}-palette`
        })
    }
}

export default sketch
