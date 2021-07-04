const makeGrid = (cellWidth, width, height) => {
    const cols = Math.floor(width / cellWidth) - 1
    const rows = Math.floor(height / cellWidth) - 1
    const outerXMargin = Math.floor(width - cellWidth * cols)
    const outerYMargin = Math.floor(height - cellWidth * rows)

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
