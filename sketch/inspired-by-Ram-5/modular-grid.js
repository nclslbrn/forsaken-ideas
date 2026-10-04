const { ceil, floor, sqrt } = Math

export default (numCell, rand, aspect = 1) => {
    // aspect = drawable height / width, so proportions are judged in real units
    const area = ([, , w, h]) => w * h

    let grid = [[0, 0, 1, 1]]

    for (let i = 0; i < numCell; i++) {
        // 1. pick the largest cell by area
        let idx = 0
        for (let k = 1; k < grid.length; k++) {
            if (area(grid[k]) > area(grid[idx])) idx = k
        }
        const [x, y, w, h] = grid[idx]

        // 2. smaller part is 25–50 % of the cell, on a random side
        const c = 0.5 - rand() * 0.25
        const [a, b] = rand() > 0.5 ? [c, 1 - c] : [1 - c, c]

        // 3. cut across the longest real side
        const parts =
            w > h * aspect
                ? [
                      [x, y, w * a, h],
                      [x + w * a, y, w * b, h]
                  ]
                : [
                      [x, y, w, h * a],
                      [x, y + h * a, w, h * b]
                  ]

        grid.splice(idx, 1, ...parts)
    }
    return grid
}
