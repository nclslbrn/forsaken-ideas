'use strict'
export default class Layer {
    /**
     * Layer class
     * @param {int} cols number cols in grid
     * @param {int} rows number rows in grid
     * @param {int} depth the height of the layer
     */
    constructor(cols, rows, depth) {
        this.cols = cols
        this.rows = rows
        this.depth = depth
        this.points = []
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.points.push({
                    weight: window.noise(x, y, this.depth),
                    x: x,
                    y: y
                })
            }
        }
    }
    /**
     * Update layer depth and noise
     * @param {int} maxDepth the number of layers
     */
    update(maxDepth) {
        this.depth += 1

        if (this.depth >= maxDepth) {
            this.depth = 1
        }
    }
    computePoints(frameIndex) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].weight = window.noise(
                this.points[i].x,
                this.points[i].y,
                frameIndex
            )
        }
    }

    /**
     * Get near point index
     * @param {object} point x and y position
     * @returns {array} of point index
     */
    getNearPoints(point) {
        const nearPoints = []
        const indexes = []
        // top
        if (point.y > 0) {
            nearPoints.push({ x: point.x, y: point.y - 1 })
        }
        // top right
        if (point.y > 0 && point.x < this.cols - 1) {
            nearPoints.push({ x: point.x + 1, y: point.y - 1 })
        }
        // right
        if (point.x < this.cols - 1) {
            nearPoints.push({ x: point.x + 1, y: point.y })
        }
        // bottom right
        if (point.x < this.cols - 1 && point.y < this.rows - 1) {
            nearPoints.push({ x: point.x + 1, y: point.y + 1 })
        }
        // bottom
        if (point.y < this.rows - 1) {
            nearPoints.push({ x: point.x, y: point.y + 1 })
        }
        // bottom left
        if (point.x >= 1 && point.y < this.rows - 1) {
            nearPoints.push({ x: point.x - 1, y: point.y + 1 })
        }
        // left
        if (point.x >= 1) {
            nearPoints.push({ x: point.x - 1, y: point.y })
        }
        // top left
        if (point.x >= 1 && point.y >= 1) {
            nearPoints.push({ x: point.x - 1, y: point.y - 1 })
        }
        // convert x and y pos to grid index
        for (let i = 0; i < nearPoints.length; i++) {
            indexes.push(nearPoints[i].x * this.rows + nearPoints[i].y)
        }
        return indexes
    }
    /**
     * Draw the layer
     * @param {float} noiseThreshold
     * @param {int} cellSize
     */
    getLines(noiseThreshold, cellSize) {
        const lines = []
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i].weight > noiseThreshold) {
                const selection = []
                const nearPoints = this.getNearPoints(this.points[i])
                for (let j = 0; j < nearPoints.length; j++) {
                    if (
                        nearPoints[j] &&
                        this.points[nearPoints[j]].weight > noiseThreshold
                    ) {
                        lines.push({
                            x1: this.points[i].x * cellSize,
                            y1: this.points[i].y * cellSize,
                            x2: this.points[nearPoints[j]].x * cellSize,
                            y2: this.points[nearPoints[j]].y * cellSize
                        })
                    }
                }
            }
        }
        return lines
    }
}
