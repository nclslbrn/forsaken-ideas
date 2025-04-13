import Walker from './Walker'

const fillWithWalkers = (canvas, cast, numWalker, step) => {
    const cnvs = document.createElement('canvas'),
        ctx = cnvs.getContext('2d', { willReadFrequently: true })

    cnvs.width = canvas.width
    cnvs.height = canvas.height
    ctx.drawImage(canvas, 0, 0)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 3
    
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

    for (let i = 0; i < numWalker; i++) {
        let ln = []
        let pos = [0, 0]
        while (!getPixel(...pos)) {
            pos = [
                Math.floor(Math.random() * canvas.width),
                Math.floor(Math.random() * canvas.height)
            ]
        }
        const walker = new Walker(
            ...pos,
            step,
            (x, y) =>
                x > 0 &&
                x < canvas.width &&
                y > 0 &&
                y < canvas.height &&
                getPixel(x, y)
        )
        for (let j = 0; j < 10 && !walker.isStuck; j++) {
            walker.walk()
            const penDown = getPixel(...walker.pos)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) {
                ln.push(walker.pos)
                if (ln.length) {
                    drawLine([ln[ln.length-1], walker.pos])
                }
            }
        }
        if(ln.length) {
            ls.push(ln)
            drawLine(ln)
        }
    }
    return ls
}

export { fillWithWalkers }
