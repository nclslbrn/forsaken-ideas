const {sin, cos, hypot, PI} = Math

const fillCell = (cell, dir, decay) => {
    
    if (dir>2) console.error(`${dir}/2`)
    
    const [cx, cy, cw, ch] = cell
    const isValidPos = (x, y) => x > cx && x < cx+cw && y > cy && y < cy+ch  
    const ls = []
    
    let res = 0.5 

    if (dir < 2) {
        // vertical lines
        if (dir === 0) {
            res = 1
            for (let x = cx-decay; x < cx+cw; x += res) {
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
            for (let y = cy-decay; y < cy+ch; y += res) {
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
        const diag = hypot(cw, ch)
        const theta = (dir === 2 ? -PI : PI) / 4
        const cntr = [cx + cw / 2, cy + ch / 2]

        res = 0.0001
        
        for (let x = cx-diag; x <= cx+diag; x += res) {
                   
            let ln = []
            for (let y = cy-diag; y <= cy+diag; y++) {
                const xx = cos(theta) * (x - cntr[0]) - sin(theta) * (y - cntr[1]) + cntr[0]
                const yy = sin(theta) * (x - cntr[0]) + cos(theta) * (y - cntr[1]) + cntr[1]
                const penDown = isValidPos(xx, yy)
                if (ln.length && !penDown) {
                    ls.push(ln)
                    ln = []
                }
                if (penDown) ln.push([xx, yy])
                res += 0.0005
            }
            ln.length && ls.push(ln)
        }
    }
    return ls
}

export { fillCell }