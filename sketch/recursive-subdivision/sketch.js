import SvgTracer from './svg-tracer'

// Based on a processing sketch of Roni Kaufman
// https://github.com/ronikaufman/mondrian_generator/blob/master/mondrian_generator.pde

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}

const sketch = {
    // Main sketch variable
    thickness: 2,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4'),
    decrease: 0.7,
    iterations: 256,
    subSize: { min: 0.2, max: 0.8 },
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
                    const xDiv = Math.round(randomBetween(sketch.subSize) * w)
                    sketch.subdivision({
                        w: xDiv,
                        h: h,
                        x: x,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false
                    })
                    sketch.subdivision({
                        w: w - xDiv,
                        h: h,
                        x: x + xDiv,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false
                    })
                } else {
                    const yDiv = Math.round(randomBetween(sketch.subSize) * h)
                    sketch.subdivision({
                        w: w,
                        h: yDiv,
                        x: x,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: true
                    })
                    sketch.subdivision({
                        w: w,
                        h: h - yDiv,
                        x: x,
                        y: y + yDiv,
                        chance: chance * sketch.decrease,
                        isVert: true
                    })
                }
            } else {
                sketch.divisions.push({
                    x: x + sketch.thickness / 2,
                    y: y + sketch.thickness / 2,
                    w: w - sketch.thickness,
                    h: h - sketch.thickness
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
        nextDivisionProps['chance'] = Math.random()
        nextDivisionProps['isVert'] = Math.random() < 0.5

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
