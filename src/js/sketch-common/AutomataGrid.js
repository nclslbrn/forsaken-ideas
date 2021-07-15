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
    init(percent = 0.35) {
        this.value = []
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
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
        const nextValue = []

        for (let x = 0; x <= this.cols; x++) {
            for (let y = 0; y <= this.rows; y++) {
                // Cell index in the flat array of this.value
                const i = this.cols * x + y
                // Alive cell around count
                let aliveAround = 0

                // top
                if (y > 0 && this.value[i - 1]) {
                    aliveAround++
                }

                // bottom
                if (y < this.rows && this.value[i + 1]) {
                    aliveAround++
                }

                // left
                if (x > 0 && this.value[i - this.cols]) {
                    aliveAround++
                }

                // right
                if (x < this.cols && this.value[i + this.cols]) {
                    aliveAround++
                }

                // top left
                if (x > 0 && y > 0 && this.value[i - this.cols - 1]) {
                    aliveAround++
                }

                // top right
                if (x < this.cols && y > 0 && this.value[i + this.cols - 1]) {
                    aliveAround++
                }

                // bottom right
                if (
                    x < this.cols &&
                    y < this.rows &&
                    this.value[i + this.cols + 1]
                ) {
                    aliveAround++
                }

                // bottom left
                if (x > 0 && y < this.rows && this.value[i - this.rows + 1]) {
                    aliveAround++
                }

                // Check if the number of alive cell around match neededAliveNeighbors
                nextValue.push(aliveAround === neededAliveNeighboors)
            }
        }
        this.value = [...nextValue]
    }
}
