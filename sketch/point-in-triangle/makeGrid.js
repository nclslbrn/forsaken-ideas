const makeGrid = (cellWidth) => {

    const cols = Math.floor(window.innerWidth / cellWidth)
    const rows = Math.floor(window.innerHeight / cellWidth)
    const outerXMargin = Math.floor(window.innerWidth - (cellWidth * cols))
    const outerYMargin = Math.floor(window.innerHeight - (cellWidth * rows))

    const grid = {
        "cols": cols,
        "rows": rows,
        "cellWidth": cellWidth,
        "outerXMargin": outerXMargin / 2,
        "outerYMargin": outerYMargin / 2

    }
    return grid
}

export default makeGrid