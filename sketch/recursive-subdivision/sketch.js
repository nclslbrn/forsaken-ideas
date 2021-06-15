import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Ptransform from '../../src/js/sketch-common/Ptransform'

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}

const sketch = {
    // Main sketch variables
    margin: 2,
    decrease: 0.7,
    expectedDivisions: 12,
    subSize: { min: 0.3, max: 0.7 },
    divisions: [],
    perspTrans: new Ptransform(0.5, 0.5),
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
    /**
     * Run once after page load (similar to processing setup())
     */
    launch: () => {
        sketch.svg.init()
        sketch.perspTrans.init(sketch.svg.width, sketch.svg.height)
        sketch.init()
    },
    /**
     * Used before first update or when user reset the sketch
     */
    init: () => {
        // Replace previous divisions with a full size rectangle
        sketch.divisions = [
            {
                p: [
                    [sketch.margin / 2, sketch.margin / 2],
                    [sketch.svg.width - sketch.margin, sketch.margin / 2],
                    [
                        sketch.svg.width - sketch.margin,
                        sketch.svg.height - sketch.margin
                    ],
                    [sketch.margin / 2, sketch.svg.height - sketch.margin]
                ],
                pos: 1
            }
        ]
        console.clear()
        sketch.svg.clear()
        sketch.svg.group({ name: 'shape' })
        sketch.svg.group({ name: 'text' })
        sketch.update()
    },

    /**
     * Main division computing
     * @typedef {division} props defines next possible division
     * @param {number} props.p an two dimension array of point
     * @param {number} props.chance probability between 0 and 1 to split,
     * @param {bool} props.isVert define vertical or horizontal split
     * @param {int} props.pos number of cut to create this shape
     */
    subdivision: (props) => {
        if (props) {
            const { p, chance, isVert } = props
            const m = sketch.margin / 2
            if (chance > Math.random()) {
                if (isVert) {
                    const _x = [
                        Math.abs(
                            randomBetween(sketch.subSize) * (p[1][0] - p[0][0])
                        ),
                        Math.abs(
                            randomBetween(sketch.subSize) * (p[2][0] - p[3][0])
                        )
                    ]
                    sketch.subdivision({
                        p: [
                            [p[0][0], p[0][1]],
                            [p[0][0] + (_x[0] - m), p[1][1]],
                            [p[3][0] + (_x[0] - m), p[2][1]],
                            [p[3][0], p[3][1]]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: props.pos + 1
                    })
                    sketch.subdivision({
                        p: [
                            [p[0][0] + _x[0] + m, p[0][1]],
                            [p[1][0], p[1][1]],
                            [p[2][0], p[2][1]],
                            [p[0][0] + _x[0] + m, p[3][1]]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: props.pos + 1
                    })
                } else {
                    const _y = Math.round(
                        randomBetween(sketch.subSize) * (p[3][1] - p[0][1])
                    )
                    sketch.subdivision({
                        p: [
                            [p[0][0], p[0][1]],
                            [p[1][0], p[1][1]],
                            [p[2][0], p[1][1] + _y - m],
                            [p[3][0], p[0][1] + _y - m]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: props.pos + 1
                    })
                    sketch.subdivision({
                        p: [
                            [p[0][0], p[0][1] + _y + m],
                            [p[1][0], p[1][1] + _y + m],
                            [p[2][0], p[2][1]],
                            [p[3][0], p[3][1]]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: props.pos + 1
                    })
                }
            } else {
                sketch.divisions.push({
                    p: [...p],
                    pos: props.pos
                })
            }
        }
    },

    /**
     * Put element in the window (kind of processing draw())
     */
    print: () => {
        sketch.svg.clearGroups()
        for (let i = 0; i < sketch.divisions.length; i++) {
            const points = sketch.divisions[i].p.map((p) => {
                return sketch.perspTrans.do['transform'](p[0], p[1])
            })
            const width = Math.round(
                Math.max(points[1][0], points[2][0]) -
                    Math.min(points[0][0], points[3][0])
            )

            const height = Math.round(
                Math.max(points[2][1], points[3][1]) -
                    Math.min(points[0][1], points[1][1])
            )
            sketch.svg.path({
                points: points,
                fill: 'tomato',
                stroke: 'rgba(0,0,0,0)',
                close: true,
                group: 'shape'
            })

            sketch.svg.text({
                x: points[0][0] + width / 2,
                y: points[0][1] + height / 2,
                fontSize: 72 * (1 / sketch.divisions[i].pos),
                text: i,
                name: i,
                fill: 'white',
                group: 'text'
            })
        }
    },

    /**
     * Function to iterate over a new subdivision
     */
    update: () => {
        const randDivisionIndex = Math.floor(
            Math.random() * sketch.divisions.length
        )
        let nextDivisionProps = sketch.divisions[randDivisionIndex]
        nextDivisionProps.chance = Math.random()
        nextDivisionProps.isVert = Math.random() < 0.5

        sketch.divisions.splice(randDivisionIndex, 1)
        sketch.subdivision({ ...nextDivisionProps })
        sketch.print()

        if (sketch.divisions.length < sketch.expectedDivisions) {
            requestAnimationFrame(sketch.update)
        } else {
            // sketch.notify('Done')
            console.log('We got ', sketch.divisions.length, ' divisions')
            console.log('Done')
        }
    },

    /**
     * Fancy notification
     */
    notify: (message) => {
        const p = document.createElement('p')
        p.setAttribute('style', 'padding: 1em;')
        p.innerHTML = message
        sketch.svg.parentElem.appendChild(p)
        console.log(message)
        window.setTimeout(() => {
            sketch.svg.parentElem.removeChild(p)
        }, 5000)
    },
    /**
     * Function to download the svg as file
     */
    export: () => {
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes(),
            filename = `recursive-division.${Y}-${m}-${d}_${H}.${i}.svg`,
            content = new Blob([sketch.svg.parentElem.innerHTML], {
                type: 'text/plain'
            })

        let svgFile = null
        if (svgFile !== null) {
            window.URL.revokeObjectURL(svgFile)
        }
        svgFile = window.URL.createObjectURL(content)

        const link = document.createElement('a')
        link.href = svgFile
        link.download = filename
        link.click()
    }
}

export { sketch }
