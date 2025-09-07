
const { floor, ceil, min, max, abs, sqrt } = Math,
    shuffle = (arr, rand) => arr.sort((_a, _b) => rand() > 0.5),
    randMinMax = (minMax, rand) => minMax[0] + rand * (minMax[1] - minMax[0])

const normGrid = (grid) => {
    if (grid.length === 0) return grid;

    // Find the actual bounds of the grid
    let minX = Infinity,
        minY = Infinity;
    let maxX = -Infinity,
        maxY = -Infinity;

    grid.forEach(([x, y, cellWidth, cellHeight]) => {
        minX = min(minX, x);
        minY = min(minY, y);
        maxX = max(maxX, x + cellWidth);
        maxY = max(maxY, y + cellHeight);
    });
    const actualWidth = maxX - minX;
    const actualHeight = maxY - minY;
    const scaleFactor = min(1 / actualWidth, 1 / actualHeight);
    return grid.map(([x, y, cellWidth, cellHeight]) => [
        (x - minX) * scaleFactor,
        (y - minY) * scaleFactor,
        cellWidth * scaleFactor,
        cellHeight * scaleFactor,
    ]);
};

const varyingFromCenterToBorder = (numCell, _) => {
    const baseCellSize = 1 / sqrt(numCell);
    const minCellSize = baseCellSize * 0.25;
    const maxCellSize = baseCellSize;
    const grid = [];

    let x = 0;
    while (x < 1) {
        const distFromCenterX = abs(0.5 - x) / 0.5;
        const xResize = 1 - distFromCenterX * distFromCenterX;
        const nCellWidth = minCellSize + (maxCellSize - minCellSize) * xResize;

        let y = 0;
        while (y < 1) {
            const distFromCenterY = abs(0.5 - y) / 0.5;
            const yResize = 1 - distFromCenterY * distFromCenterY;
            const nCellHeight = minCellSize + (maxCellSize - minCellSize) * yResize;
            grid.push([x, y, nCellWidth, nCellHeight]);
            y += nCellHeight;
        }
        x += nCellWidth;
    }
    return normGrid(grid);
};

const varyingFromToBorderCenter = (numCell, _) => {
    const baseCellSize = 1 / sqrt(numCell);
    const minCellSize = baseCellSize * 0.25;
    const maxCellSize = baseCellSize;
    const grid = [];

    let x = 0;
    while (x < 1) {
        const distFromCenterX = abs(0.5 - x) / 0.5;
        const xResize = distFromCenterX * distFromCenterX;
        const nCellWidth = minCellSize + (maxCellSize - minCellSize) * xResize;

        let y = 0;
        while (y < 1) {
            const distFromCenterY = abs(0.5 - y) / 0.5;
            const yResize = distFromCenterY * distFromCenterY;
            const nCellHeight = minCellSize + (maxCellSize - minCellSize) * yResize;
            grid.push([x, y, nCellWidth, nCellHeight]);
            y += nCellHeight;
        }

        x += nCellWidth;
    }
    return normGrid(grid);
};

const randomVaryingWidth = (numCell, rand) => {
    const colRow = sqrt(numCell)
    const baseCellSize = 1 / colRow;
    const minCellSize = baseCellSize * 0.25;
    const maxCellSize = baseCellSize * 2;
    const heights = []
    let y = 0, dy = 0;
    while (y <= 1) {
        const distFromCenterY = abs(0.5 - y) / 0.5;
        const yResize = distFromCenterY * distFromCenterY;
        const nCellHeight = minCellSize + (maxCellSize - minCellSize) * yResize;
        heights.push(nCellHeight)
        y += nCellHeight;
    }
    heights.forEach((h, i) => heights[i] = h /= y)
    const grid = [];

    for (let i = 0; i < heights.length; i++) {
        const row = []
        for (let x = 0; x < sqrt(numCell); x++) {
            row.push(randMinMax([0.05, 0.95], rand()) * colRow)
        }
        const sumWidth = row.reduce((sum, cellWidth) => sum += cellWidth, 0)
        row.forEach((_, i) => { row[i] /= sumWidth })

        const [cellRow, _] = row.reduce((acc, w) =>
            [[...acc[0], [acc[1], dy, w, heights[i]]], acc[1] + w],
            [[], 0]
        )
        dy += heights[i]
        grid.push(...cellRow)
    }
    return grid;
};

const modular = (numCell, rand) => {
    const splitCell = (cellIdx, isHorizontal, grid) => {
        if (grid[cellIdx] === undefined) return grid;
        const [x, y, w, h] = grid[cellIdx];
        const c = 1 / ceil(1 + rand() * 4);
        let splitted = [];
        if (isHorizontal) {
            const ws = shuffle([w * c, w * (1 - c)], rand);
            splitted = [
                [x, y, ws[0], h],
                [x + ws[0], y, ws[1], h],
            ];
        } else {
            const hs = shuffle([h * c, h * (1 - c)], rand);
            splitted = [
                [x, y, w, hs[0]],
                [x, y + hs[0], w, hs[1]],
            ];
        }
        grid.splice(cellIdx, 1);
        grid.push(...splitted);
        return grid;
    };

    let grid = [[0, 0, 1, 1]];
    for (let i = 0; i < sqrt(numCell); i++) {
        grid = splitCell(floor(rand() * grid.length), rand() > 0.5, grid);
    }
    return grid;
};

const straight = (numCell, _) => {
    const colrow = sqrt(numCell),
        cellSize = 1 / colrow,
        grid = [];

    for (let x = 0; x < colrow; x++) {
        for (let y = 0; y < colrow; y++) {
            grid.push([x * cellSize, y * cellSize, cellSize, cellSize]);
        }
    }
    return normGrid(grid);
};

export default [
    varyingFromCenterToBorder,
    varyingFromToBorderCenter,
    randomVaryingWidth,
    modular,
    straight
];