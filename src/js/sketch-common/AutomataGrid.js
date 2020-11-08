export default class AutomataGrid {
    /**
     * Build a grid
     * @param {number} cols number of columns of the grid
     * @param {number} rows number of rows of the grid
     */
    constructor(cols, rows) {
        this.cols = cols
        this.rows = rows
        this.value = []
    }

    /**
     * Fill the grid with random value
     * @param {number} percent of chance that cell is alive
     */
    init(percent = 0.5) {
        this.value = []
        for (let x = 0; x <= this.cols; x++) {
            for (let y = 0; y <= this.rows; y++) {
                this.value.push(Math.random() < percent)
            }
        }
    }

    /**
     * Read each cell and change state (dead/alive) of them
     * @param {number} neededAliveNeighboors the number of alive
     * cell around to consider the current cell alive
     * (exact match, not more, not less)
     */
    update(neededAliveNeighboors = 2) {
        const lastValue = [...this.value]
        const nextValue = []

        for (let x = 0; x <= this.cols; x++) {
            for (let y = 0; y <= this.rows; y++) {
                // Cell index in the flat array of this.value
                const i = y * this.cols + x
                // Alive cell around count
                let aliveAround = 0

                // top
                if (x > 0 && lastValue[i - this.rows]) {
                    aliveAround++
                }

                // bottom
                if (x > this.cols && lastValue[i + this.rows]) {
                    aliveAround++
                }

                // left
                if (y > 0 && lastValue[i - 1]) {
                    aliveAround++
                }

                // right
                if (y < this.rows && lastValue[i + 1]) {
                    aliveAround++
                }

                // top left
                if (x > 0 && y > 0 && lastValue[i - this.rows - 1]) {
                    aliveAround++
                }

                // top left
                if (x > 0 && y < this.rows && lastValue[i - this.rows + 1]) {
                    aliveAround++
                }

                // bottom right
                if (
                    x < this.cols &&
                    y < this.rows &&
                    lastValue[i + this.rows + 1]
                ) {
                    aliveAround++
                }

                // bottom left
                if (x > 0 && y < this.rows && lastValue[i + this.rows - 1]) {
                    aliveAround++
                }

                // Check if the number of alive cell around match neededAliveNeighbors
                nextValue.push(aliveAround === neededAliveNeighboors)
            }
        }
        this.value = [...nextValue]
    }
}