const { sin, cos, sqrt, PI, hypot, random, floor } = Math
/**
 * Draw straight lines inside cell
 *
 * @param {Array} cell - [x, y, width, height] of the cell
 * @param {Number} dir - 0|1|2|3 axis/rotation of the lines (vertical, horizontal, diag1 & diag2)
 * @param {Number} res - spacing/margin between lines
 *
 * @returns {Array} - a multidimenional array of lines [[[x,y], [x,y]], ...]
 */

export default function ([cx, cy, cw, ch], dir, res) {
    const ls = []

    if (dir < 2) {
        // vertical lines
        if (dir === 0) {
            for (let x = cx; x < cx+cw; x += res) {
                let ln = []
                for (let y = cy; y < cy+ch; y += res) {
                    ln.push([x, y])
                }
                ln.length && ls.push(ln)
            }
        }
        // horizontal lines
        else {
            for (let y = cy; y < cy+ch; y += res) {
                let ln = []
                for (let x = cx; x < cx+cw; x += res) {
                    ln.push([x, y])
                }
                ln.length && ls.push(ln)
            }
        }
    }
    // diagonal lines
    else {
        const step = hypot(res, res)
        const diag = hypot(cw, ch)
        const theta = (dir === 2 ? -PI : PI) / 4
        const cntr = [cx + (cw / 2), cy + (ch / 2)]
        for (let x = -diag; x <= diag; x += step) {
            let ln = []
            for (let y = -diag; y <= diag; y += step) {
                const xx =
                    cos(theta) * (x - cntr[0]) -
                    sin(theta) * (y - cntr[1]) +
                    cntr[0]
                const yy =
                    sin(theta) * (x - cntr[0]) +
                    cos(theta) * (y - cntr[1]) +
                    cntr[1]

                if (xx >= 0 && xx < cw && yy >= 0 && yy < ch) {
                    ln.push([xx, yy])
                }
            }
            ln.length && ls.push(ln)
        }
    }

    return ls
}
 