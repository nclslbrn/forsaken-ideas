const {sin, cos, hypot, PI} = Math

const fillCell = (cell, dir) => {

    const [cx, cy, cw, ch] = cell
    const isValidPos = (x, y) => x > cx && x < cx+cw && y > cy && y < cy+ch  
    const ls = []
    
    let res = 1 

    if (dir < 2) {
        // vertical lines
        if (dir === 0) {
            res = 1
            for (let x = cx; x < cx+cw; x += res) {
                let ln = []
                for (let y = cy; y < cy+ch; y++) {
                    const penDown = isValidPos(x, y)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([x, y])
                }
                ln.length && ls.push(ln)
                res++
            }
        }
        // horizontal lines
        else {
            res = 1
            for (let y = cy; y < cy+ch; y += res) {
                let ln = []
                for (let x = cx; x < cx+cw; x++) {
                    const penDown = isValidPos(x, y)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([x, y])
                }
                ln.length && ls.push(ln)
                res++
            }
        }
    }
    // diagonal lines
    else {
        const step = hypot(res, res)
        const diag = hypot(cw, ch)
        const theta = (dir === 2 ? -PI : PI) / 4
        const cntr = [cx + cw / 2, cy + ch / 2]
        res=1
        for (let x = -diag; x <= diag; x += step) {
            let ln = []
            for (let y = -diag; y <= diag; y += step) {
                const xx = cos(theta) * (x - cntr[0]) - sin(theta) * (y - cntr[1]) + cntr[0]
                const yy = sin(theta) * (x - cntr[0]) + cos(theta) * (y - cntr[1]) + cntr[1]

                if (xx >= cx && xx < cx+cw && yy >= cy && yy < cy+ch) {
                    const penDown = isValidPos(xx, yy)
                    if (ln.length && !penDown) {
                        ls.push(ln)
                        ln = []
                    }
                    if (penDown) ln.push([xx, yy])
                }
            }
            ln.length && ls.push(ln)
            res++
        }
    }
    return ls
}

export { fillCell }