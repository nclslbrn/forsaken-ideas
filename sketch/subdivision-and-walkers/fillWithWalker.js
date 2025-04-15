import Walker from './Walker'
import { repeatedly2d } from '@thi.ng/transducers'
/**
 * Fill canvas with random walkers lines
 * @constructor
 * @param {Element} canvas - the source canvas with the initial composition
 * @param {Function} cast - a function wich return true/false based on pixel color (grayscale)
 * @param {number} numWalker - the number of active walkers
 * @param {number} step - the length of walkers move
 */
const fillWithWalkers = (canvas, cast, numWalker, step) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true })

    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1

    const ls = []
    const getPixel = (x, y) => {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return false
        }
        const pixel = ctx.getImageData(x, y, 1, 1).data
        return cast(pixel[0]) && cast(pixel[1]) && cast(pixel[2])
    }
    const drawLine = (ln) => {
        ctx.beginPath()
        ctx.moveTo(ln[0][0], ln[0][1])
        for (let i = 0; i < ln.length; i++) {
            ctx.lineTo(ln[i][0], ln[i][1])
        }
        ctx.stroke()
    }

    const isRightPath = (x, y) =>
        x > 0 &&
        x < canvas.width &&
        y > 0 &&
        y < canvas.height &&
        getPixel(x, y)

    const walkerPerAxis = Math.sqrt(numWalker)
    const walkerPos = [...repeatedly2d((x, y) => 
      [ 
        x * (canvas.width/walkerPerAxis),
        y * (canvas.height/walkerPerAxis)
      ],
      walkerPerAxis, walkerPerAxis
    )]

    for (const startingPos of walkerPos) {
        let ln = []
        let pos = startingPos
        const walker = new Walker(...pos, step, isRightPath)
        
        for (let j = 0; j < 10 && !walker.isStuck; j++) {
            
            walker.walk()
            const penDown = getPixel(...walker.pos)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) {
                ln.push(walker.pos)
                //ln.length && drawLine([ln[ln.length - 1], walker.pos])
            }
        }
        if (ln.length) {
            ls.push(ln)
            // drawLine(ln)
        }
    }
    return ls
}

export { fillWithWalkers }
