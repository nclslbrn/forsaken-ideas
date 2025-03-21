import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

const { sin, cos, PI, hypot } = Math

const fillWithFlowField = (canvas, cast, res, seed) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true }),
        noise = createNoise2D(alea(seed))

    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)

    const v = [],
        ls = []
    const getPixel = (x, y) => {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return false
        }
        const pixel = ctx.getImageData(x, y, 1, 1).data
        return cast(pixel[0]) && cast(pixel[1]) && cast(pixel[2])
    }

    for (let x = 0; x < canvas.width; x += res) {
        for (let y = 0; y < canvas.height; y += res) {
            v.push([
                x + (Math.random() - 0.5) * res * 0.5,
                y + (Math.random() - 0.5) * res * 0.5
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

const fillWithStraightLines = (canvas, cast, res, dir) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true })

    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)

    const ls = []
    const getPixel = (x, y) => {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return false
        }
        const pixel = ctx.getImageData(x, y, 1, 1).data
        return cast(pixel[0]) && cast(pixel[1]) && cast(pixel[2])
    }

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
        const theta = dir === 2 ? -PI / 4 : PI / 4
        const cntr = [canvas.width / 2, canvas.height / 2]

        for (let x = -diag; x <= diag; x += step) {
            let ln = []
            for (let y = -diag; y <= diag; y++) {
                const xx = cos(theta) * (x - cntr[0]) - sin(theta) * (y - cntr[1]) + cntr[0]
                const yy = sin(theta) * (x - cntr[0]) + cos(theta) * (y - cntr[1]) + cntr[1]
                if (xx >= 0 && xx < canvas.width && yy >= 0 && yy < canvas.height) {

                    const penDown = getPixel(xx, yy)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([xx, yy])
                }
            }
            ln.length && ls.push(ln)
        }
    }


    return ls
}

export { fillWithFlowField, fillWithStraightLines }
