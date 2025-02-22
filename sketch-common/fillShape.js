import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

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

const fillWithStraightLines = (canvas, cast, res, isVertical) => {
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

    if (isVertical) {
        for (let x = 0; x < canvas.width; x += res) {
            let ln = []
            for (let y = 0; y < canvas.height; y += res) {
                const penDown = getPixel(x, y)
                if (ln.length && !penDown) {
                    ls.push(ln)
                    ln = []
                }
                if (penDown) ln.push([x, y])
            }
            ln.length && ls.push(ln)
        }
    } else {
        for (let y = 0; y < canvas.height; y += res) {
            let ln = []
            for (let x = 0; x < canvas.width; x += res) {
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
    return ls
}

export { fillWithFlowField, fillWithStraightLines }
