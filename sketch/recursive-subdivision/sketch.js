import SvgTracer from './svg-tracer'
// Based on a processing sketch of Roni Kaufman
// https://github.com/ronikaufman/mondrian_generator/blob/master/mondrian_generator.pde

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}

const sketch = {
    // Main sketch variables
    thickness: 1,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
    decrease: 0.7,
    iterations: 54,
    subSize: { min: 0.15, max: 0.85 },
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
                y: sketch.thickness / 2,
                pos: 1
            }
        ]
        sketch.nIter = 0
        sketch.update()
    },

    /**
     * Main division computing
     * @typedef {division} props defines next possible division
     * @param {number} props.w width
     * @param {number} props.h height
     * @param {number} props.x top left x position
     * @param {number} props.y top left y position,
     * @param {number} props.chanceprobability between 0 and 1 to split,
     * @param {bool} props.isVert define vertical or horizontal split
     * @param {int} props.pos number of cut to create this shape
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
                        isVert: false,
                        pos: props.pos + 1
                    })
                    sketch.subdivision({
                        w: w - xDiv,
                        h: h,
                        x: x + xDiv,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: props.pos + 1
                    })
                } else {
                    const yDiv = Math.round(randomBetween(sketch.subSize) * h)
                    sketch.subdivision({
                        w: w,
                        h: yDiv,
                        x: x,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: props.pos + 1
                    })
                    sketch.subdivision({
                        w: w,
                        h: h - yDiv,
                        x: x,
                        y: y + yDiv,
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: props.pos + 1
                    })
                }
            } else {
                sketch.divisions.push({
                    x: x + sketch.thickness / 2,
                    y: y + sketch.thickness / 2,
                    w: Math.abs(w - sketch.thickness),
                    h: Math.abs(h - sketch.thickness),
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
        const fontSize = 32
        for (let i = 0; i < sketch.divisions.length; i++) {
            sketch.svg.rect({
                ...sketch.divisions[i],
                fill: 'white',
                stroke: 'black'
            })
            sketch.svg.text({
                ...sketch.divisions[i],
                fontSize: fontSize * (1 / sketch.divisions[i].pos),
                text: sketch.divisions[i].pos
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
