import Walker from './Walker'

const isLineLineIntersecting = (ln, lm) => {
    let det, gamma, lambda

    det =
        (ln[1][0] - ln[0][0]) * (lm[1][1] - lm[0][1]) -
        (lm[1][0] - lm[0][0]) * (ln[1][1] - ln[0][1])
    if (det === 0) {
        return false
    } else {
        lambda =
            ((lm[1][1] - lm[0][1]) * (lm[1][0] - ln[0][0]) +
                (lm[0][0] - lm[1][0]) * (lm[1][1] - ln[0][1])) /
            det
        gamma =
            ((ln[0][1] - ln[1][1]) * (lm[1][0] - ln[0][0]) +
                (ln[1][0] - ln[0][0]) * (lm[1][1] - ln[0][1])) /
            det
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
    }
}

const isLineMultilineIntersecting = (ln, lines) =>
    lines.reduce((intersect, line) => {
        for (let i = 0; i < line.length - 1; i++) {
            if (isLineLineIntersecting(ln, [line[i], line[i + 1]])) {
                return true
            }
        }
        return intersect
    }, false)

const fillWithWalkers = (canvas, cast, numWalker) => {
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

    for (let i = 0; i < numWalker; i++) {
        let ln = []
        const walker = new Walker(
            Math.floor(Math.random() * canvas.width),
            Math.floor(Math.random() * canvas.height),
            50,
            (x, y) =>
                x > 0 &&
                x < canvas.width &&
                y > 0 &&
                y < canvas.height &&
                getPixel(x, y) &&
                !isLineMultilineIntersecting([x, y], ls)
        )
        for (let j = 0; j < 10; j++) {
            walker.walk()
            const penDown = getPixel(...walker.pos)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) ln.push(walker.pos)
        }
        ln.length && ls.push(ln)
    }
    return ls
}

export { fillWithWalkers }
