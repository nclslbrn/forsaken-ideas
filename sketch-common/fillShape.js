
// Flow field
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

// Walker 
import Walker from './Walker'
import { repeatedly2d } from '@thi.ng/transducers'

const { sin, cos, sqrt, PI, hypot, random, floor } = Math

/**
 * Draw lines based on a flow field hover a canvas, 
 * decide which pixels ignore with the cast function
 * 
 * @param {Element} canvas the HTML canvas element 
 * @param {Function} cast a function returning a 
 * boolean to decide whether draw line from pixel color 
 * @param {Number} res spacing between each particles
 * @param {Number} seed a seed for Perlin noise
 * @returns {Array} a multidimenional array of lines [[[x,y], [x,y]], ...]
 */
const fillWithFlowField = (canvas, cast, res, seed) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true }),
        noise = createNoise2D(alea(seed))

    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)
    
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const getPixel = (x, y) => {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return false
        }
        const pixIdx = (floor(x) + floor(y) * floor(cnvs.width)) * 4
        const pixel = [
          pixels[pixIdx], pixels[pixIdx + 1], pixels[pixIdx + 2],
        ]
        return cast(pixel[0]) && cast(pixel[1]) && cast(pixel[2]) 
    }

    const v = [], ls = []    
    for (let x = 0; x < canvas.width; x += res) {
        for (let y = 0; y < canvas.height; y += res) {
            v.push([
                x + (random() - 0.5) * res * 0.5,
                y + (random() - 0.5) * res * 0.5
            ])
        }
    }

    for (let i = 0; i < v.length; i++) {
        let pos = v[i],
            ln = []

        for (let j = 0; j < res * 4; j++) {
            const n = noise(pos[0] * 0.003, pos[1] * 0.003)
            pos = [pos[0] + Math.cos(n), pos[1] + Math.sin(n)]
            const penDown = getPixel(...pos)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) ln.push(pos)
        }
        ln.length && ls.push(ln)
    }
    return ls
}

/**
 * Draw straight lines hover a canvas, 
 * decide which pixels ignore with the cast function
 * 
 * @param {Element} canvas - a HTML canvas element
 * @param {Function} cast - a function (the gray value as arg) 
 * returning true if we can draw or false if not
 * @param {Number} res - spacing/margin between lines
 * @param {Number} - 0|1|2|3 axis/rotation of the lines
 * @returns {Array} - a multidimenional array of lines [[[x,y], [x,y]], ...]
 */
const fillWithStraightLines = (canvas, cast, res, dir) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true })

    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const getPixel = (x, y) => {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return false
        }
        const pixIdx = (floor(x) + floor(y) * canvas.width) * 4
        const pixel = [
          pixels[pixIdx], pixels[pixIdx + 1], pixels[pixIdx + 2],
        ]
        return cast(pixel[0]) && cast(pixel[1]) && cast(pixel[2]) 
    }
    const ls = []

    if (dir < 2) {
        // vertical lines
        if (dir === 0) {
            for (let x = 0; x < canvas.width; x += res) {
                let ln = []
                for (let y = 0; y < canvas.height; y++) {
                    const penDown = getPixel(x, y)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([x, y])
                }
                ln.length && ls.push(ln)
            }
        }
        // horizontal lines
        else {
            for (let y = 0; y < canvas.height; y += res) {
                let ln = []
                for (let x = 0; x < canvas.width; x++) {
                    const penDown = getPixel(x, y)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([x, y])
                }
                ln.length && ls.push(ln)
            }
        }
    }
    // diagonal lines
    else {
        const step = hypot(res, res)
        const diag = hypot(canvas.width, canvas.height)
        const theta = (dir === 2 ? -PI : PI) / 4
        const cntr = [canvas.width / 2, canvas.height / 2]
        for (let x = -diag; x <= diag; x += step) {
            let ln = []
            for (let y = -diag; y <= diag; y++) {
                const xx = cos(theta) * (x - cntr[0]) - sin(theta) * (y - cntr[1]) + cntr[0]
                const yy = sin(theta) * (x - cntr[0]) + cos(theta) * (y - cntr[1]) + cntr[1]

                // if (xx >= 0 && xx < canvas.width && yy >= 0 && yy < canvas.height) {
                    const penDown = getPixel(xx, yy)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([xx, yy])
                // }
            }
            ln.length && ls.push(ln)
        }
    }


    return ls
}

/**
 * Fill canvas with random walkers lines
 * 
 * @param {Element} canvas - the source canvas with the initial composition
 * @param {Function} cast - a function wich return true/false based on pixel color (grayscale)
 * @param {Number} numWalker - the number of active walkers
 * @param {Number} step - the length of walkers move
 * @returns {Array} - a multidimenional array of lines [[[x,y], [x,y]], ...] 
 */
const fillWithWalkers = (canvas, cast, numWalker, step) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true })
    
    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1.5

    const ls = []
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const getPixel = (x, y) => {
        if (x < 0 || x >= cnvs.width || y < 0 || y >= cnvs.height) {
            return false
        }
        const pixIdx = (floor(x) + floor(y) * floor(cnvs.width)) * 4
        const pixel = [pixels[pixIdx], pixels[pixIdx + 1], pixels[pixIdx + 2]]
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

    const walkerPerAxis = sqrt(numWalker)
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
                ln.length && drawLine([ln[ln.length - 1], walker.pos])
            }
        }
        if (ln.length) {
            ls.push(ln)
            drawLine(ln)
        }
    }
    return ls
}


export { fillWithFlowField, fillWithStraightLines, fillWithWalkers }
