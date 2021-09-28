export default class Grid {
    constructor(cellWidth, cellPadding, width, height) {
        this.cellPadding = cellPadding
        this.cellWidth = cellWidth

        this.cols = Math.floor( width / this.cellWidth)
        this.rows = Math.floor( height / this.cellWidth)

        this.margin = {
            x: (width % (this.cellWidth * this.cols)) / 2,
            y: (height % (this.cellWidth * this.rows)) / 2
        }
    }
}