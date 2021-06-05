import SvgTracer from './svg-tracer'

// Based on a processing sketch of Roni Kaufman
// https://github.com/ronikaufman/mondrian_generator/blob/master/mondrian_generator.pde

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}

const sketch = {
    // Main sketch variable
    thickness: 4,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4'),
    decrease: 0.7,
    iterations: 36,
    subSize: { min: 0.3, max: 0.7 },
    nIter: 0,
    divisions: [],

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
                w: sketch.svg.width - sketch.thickness,
                h: sketch.svg.height - sketch.thickness,
                x: sketch.thickness / 2,
                y: sketch.thickness / 2
            }
        ]
        sketch.update()
    },

    /**
     * Main division computing
     * @param {object} props {
     *  @property w: width
     *  @property h: height:
     *  @property x: top left x position
     *  @property y: top left y position,
     *  @property chance: probability between 0 and 1 to split,
     *  @property isVert: boolean define vertical or horizontal split
     * }
     */
    subdivision: (props) => {
        if (props) {
            const { w, h, x, y, chance, isVert } = props
            if (chance > Math.random()) {
                if (isVert) {
                    const nW = Math.round(randomBetween(sketch.subSize) * w)
                    if (Number.isNaN(nW)) console.log(props)
                    sketch.subdivision(
                        nW,
                        h,
                        x,
                        y,
                        chance * sketch.decrease,
                        false
                    )
                    sketch.subdivision(
                        w - nW,
                        h,
                        x + nW,
                        y,
                        chance * sketch.decrease,
                        false
                    )
                } else {
                    const nH = Math.round(randomBetween(sketch.subSize) * h)
                    if (Number.isNaN(nH)) console.log(props)
                    sketch.subdivision(
                        w,
                        nH,
                        x,
                        y,
                        chance * sketch.decrease,
                        true
                    )
                    sketch.subdivision(
                        w,
                        h - nH,
                        x,
                        y - nH,
                        chance * sketch.decrease,
                        true
                    )
                }
            } else {
                const newDivision = {
                    x: x + sketch.thickness / 2,
                    y: y + sketch.thickness / 2,
                    w: w - sketch.thickness,
                    h: h - sketch.thickness
                }
                console.log('newDivision', newDivision)
                sketch.divisions.push(newDivision)
            }
        }
    },

    /**
     * Put element in the window (kind of processing draw())
     */
    print: () => {
        //console.log(sketch.divisions)
        sketch.svg.clear()
        for (let i = 0; i < sketch.divisions.length; i++) {
            let rectProps = sketch.divisions[i]
            rectProps['fill'] = 'rgba(0,0,0,0)'
            rectProps['stroke'] = 'steelBlue'
            sketch.svg.rect({ ...rectProps })
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
        if (Number.isNaN(nextDivisionProps.w)) {
            console.log(
                '0 > ',
                randDivisionIndex,
                ' < ',
                sketch.divisions.length
            )
        }
        nextDivisionProps['chance'] = Math.random()
        nextDivisionProps['isVert'] = Math.random() < 0.5

        sketch.subdivision({ ...nextDivisionProps })
        // sketch.divisions.splice(randDivisionIndex)
        // sketch.print()

        if (sketch.nIter < sketch.iterations) {
            /* console.log(
                "Iteration doesn't suck",
                sketch.nIter,
                '/',
                sketch.iterations
            ) */
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
