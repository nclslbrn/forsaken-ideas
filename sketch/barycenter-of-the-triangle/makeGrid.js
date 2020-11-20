const makeGrid = (cellWidth) => {
    const cols = Math.floor(window.innerWidth / cellWidth) - 1
    const rows = Math.floor(window.innerHeight / cellWidth) - 1
    const outerXMargin = Math.floor(window.innerWidth - cellWidth * cols)
    const outerYMargin = Math.floor(window.innerHeight - cellWidth * rows)

    const grid = {
        cols: cols,
        rows: rows,
        cellWidth: cellWidth,
        outerXMargin: outerXMargin / 2,
        outerYMargin: outerYMargin / 2
    }
    return grid
}

export default makeGrid
