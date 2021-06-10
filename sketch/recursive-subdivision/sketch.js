import SvgTracer from './svg-tracer'

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}

const sketch = {
    // Main sketch variables
    margin: 4,
    decrease: 0.7,
    iterations: 16,
    subSize: { min: 0.3, max: 0.7 },
    nIter: 0,
    divisions: [],
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
    /**
     * Run once after page load (similar to processing setup())
     */
    launch: () => {
        sketch.svg.init()
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
        sketch.nIter = 0
        sketch.update()
    },

    /**
     * Main division computing
     * @typedef {division} props defines next possible division
     * @param {number} props.p an two dimension array of point
     * @param {number} props.chanceprobability between 0 and 1 to split,
     * @param {bool} props.isVert define vertical or horizontal split
     * @param {int} props.pos number of cut to create this shape
     */
    subdivision: (props) => {
        if (props) {
            const { p, chance, isVert } = props
            const hlfMarg = sketch.margin / 2
            if (chance > Math.random()) {
                if (isVert) {
                    const xDiv = Math.round(
                        randomBetween(sketch.subSize) * (p[1][0] - p[0][0])
                    )
                    console.log(xDiv)
                    sketch.subdivision({
                        p: [
                            [p[0][0], p[0][1]],
                            [p[0][0] + xDiv - hlfMarg, p[1][1]],
                            [p[0][0] + xDiv - hlfMarg, p[2][1]],
                            [p[3][0], p[3][1]]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: props.pos + 1
                    })
                    sketch.subdivision({
                        p: [
                            [p[0][0] + xDiv + hlfMarg, p[0][1]],
                            [p[1][0], p[1][1]],
                            [p[2][0], p[2][1]],
                            [p[0][0] + xDiv + hlfMarg, p[3][1]]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: props.pos + 1
                    })
                } else {
                    const yDiv = Math.round(
                        randomBetween(sketch.subSize) * (p[3][1] - p[0][1])
                    )
                    console.log(yDiv)
                    sketch.subdivision({
                        p: [
                            [p[0][0], p[0][1]],
                            [p[1][0], p[1][1]],
                            [p[2][0], p[1][1] + yDiv - hlfMarg],
                            [p[3][0], p[0][1] + yDiv - hlfMarg]
                        ],
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: props.pos + 1
                    })
                    sketch.subdivision({
                        p: [
                            [p[0][0], p[0][1] + yDiv + hlfMarg],
                            [p[1][0], p[1][1] + yDiv + hlfMarg],
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
        //console.log(sketch.divisions)
        sketch.svg.clear()
        //const fontSize = 128
        for (let i = 0; i < sketch.divisions.length; i++) {
            console.log(sketch.divisions[i].p)
            sketch.svg.path({
                points: sketch.divisions[i].p,
                fill: 'tomato',
                stroke: 'rgba(0,0,0,0)'
            })
            /*             const fs = fontSize * (1 / sketch.divisions[i].pos)
            sketch.svg.text({
                x: sketch.divisions[i].x + sketch.divisions[i].w / 2 - fs / 2,
                y: sketch.divisions[i].y + sketch.divisions[i].h / 2 + fs / 2,
                fontSize: fs,
                text: String(sketch.divisions[i].pos)
            }) */
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

        if (sketch.nIter < sketch.iterations) {
            requestAnimationFrame(sketch.update)
            sketch.nIter++
        } else {
            sketch.notify('Done')
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
    export: () => {}
}

export { sketch }
