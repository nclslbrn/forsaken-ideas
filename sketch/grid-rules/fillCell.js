const { sin, cos, hypot, sqrt, pow, max, PI } = Math

const verticalLines = ([cx, cy, cw, ch], decay, isValidPos, res) => {
    const ls = []
    for (let x = cx - decay; x < cx + cw; x += res) {
        let ln = []
        for (let y = cy; y < cy + ch; y++) {
            const penDown = isValidPos(x, y)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) ln.push([x, y])
        }
        ln.length && ls.push(ln)
        res *= 1.07
    }
    return ls
}

const horizontalLines = ([cx, cy, cw, ch], decay, isValidPos, res) => {
    const ls = []
    for (let y = cy - decay; y < cy + ch; y += res) {
        let ln = []
        for (let x = cx; x < cx + cw; x++) {
            const penDown = isValidPos(x, y)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) ln.push([x, y])
        }
        ln.length && ls.push(ln)
        res *= 1.07
    }
    return ls
}

const diagonalLines = ([cx, cy], isValidPos, res, theta, cntr, diag) => {
    const ls = []
    for (let x = cx - diag; x <= cx + diag; x += res) {
        let ln = []
        for (let y = cy - diag; y <= cy + diag; y++) {
            const xx =
                cos(theta) * (x - cntr[0]) -
                sin(theta) * (y - cntr[1]) +
                cntr[0]
            const yy =
                sin(theta) * (x - cntr[0]) +
                cos(theta) * (y - cntr[1]) +
                cntr[1]
            const penDown = isValidPos(xx, yy)
            if (ln.length && !penDown) {
                ls.push(ln)
                ln = []
            }
            if (penDown) ln.push([xx, yy])
        }
        res *= 1.03
        ln.length && ls.push(ln)
    }
    return ls
}

const arcLines = (
    [cx, cy, cw, ch],
    decay,
    isValidPos,
    res,
    [x, y],
    [start, end]
) => {
    const s = max(cw, ch)
    const ls = []
    for (let d = decay; d <= sqrt(pow(s, 2) * 2); d += res) {
        const ln = []
        for (let l = start; l <= end; l += 0.01) {
            const ax = x + cos(l) * d,
                ay = y + sin(l) * d
            isValidPos(ax, ay) && ln.push([ax, ay])
        }
        ln.length && ls.push(ln)
        res *= 1.03
    }
    return ls
}

const fillCell = (cell, dir, decay) => {
    if (dir > 7) console.error(`${dir}/7`)

    const [cx, cy, cw, ch] = cell
    const isValidPos = (x, y) => x > cx && x < cx + cw && y > cy && y < cy + ch

    switch (dir) {
        case 0:
            return verticalLines(cell, decay, isValidPos, 1)
        case 1:
            return horizontalLines(cell, decay, isValidPos, 1)
        case 2:
        case 3:
            const diag = hypot(cw, ch)
            const theta = (dir === 2 ? -PI : PI) / 4
            const cntr = [cx + cw / 2, cy + ch / 2]
            return diagonalLines(cell, isValidPos, 1e-8, theta, cntr, diag)
        case 4:
        case 5:
        case 6:
        case 7:
            const cntrs = [
                [cx, cy], // left to top
                [cx + cw, cy], // top to right
                [cx + cw, cy + ch], // right to bottom
                [(cx, cy + ch)] // bottom to left
            ]
            const startEnds = [
                // same order here
                [0, PI / 2],
                [PI / 2, PI],
                [PI, PI * 1.5],
                [PI * 1.5, PI * 2]
            ]
            return arcLines(
                cell,
                decay,
                isValidPos,
                2,
                cntrs[dir % 4],
                startEnds[dir % 4]
            )
    }
}

export { fillCell }
