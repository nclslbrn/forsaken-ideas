const { ceil, floor, sqrt } = Math

export default (numCell, rand) => {
    const shuffle = (arr, rand) => arr.sort((_a, _b) => rand() > 0.5)
    const splitCell = (cellIdx, isHorizontal, grid) => {
        if (grid[cellIdx] === undefined) return grid
        const [x, y, w, h] = grid[cellIdx]
        const c = 1 / ceil(1 + rand() * 4)
        let splitted = []
        if (isHorizontal) {
            const ws = shuffle([w * c, w * (1 - c)], rand)
            splitted = [
                [x, y, ws[0], h],
                [x + ws[0], y, ws[1], h]
            ]
        } else {
            const hs = shuffle([h * c, h * (1 - c)], rand)
            splitted = [
                [x, y, w, hs[0]],
                [x, y + hs[0], w, hs[1]]
            ]
        }
        grid.splice(cellIdx, 1)
        grid.push(...splitted)
        return grid
    }

    let grid = [[0, 0, 1, 1]]
    for (let i = 0; i < numCell; i++) {
        grid = splitCell(floor(rand() * grid.length), rand() > 0.5, grid)
    }
    return grid
}
