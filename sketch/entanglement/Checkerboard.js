export default class Checkerboard {
    constructor(inner, outermargin, checkerNum) {
        this.margin = outermargin
        const innerHypo = Math.sqrt(
            Math.pow(inner[0], 2) + Math.pow(inner[1], 2)
        )
        const cellHypo = innerHypo / checkerNum
        this.checkerNum = checkerNum
        this.cellSize = cellHypo / Math.sqrt(2)
        this.inner = inner
        this.padding = [
            (inner[0] % this.cellSize) / 2,
            (inner[1] % this.cellSize) / 2
        ]
    }

    getCells() {
        const cells = []
        for (let x = 0; x < Math.floor(this.inner[0] / this.cellSize); x++) {
            for (
                let y = 0;
                y < Math.floor(this.inner[1] / this.cellSize);
                y++
            ) {
                cells.push({
                    x: this.margin + this.padding[0] + x * this.cellSize,
                    y: this.margin + this.padding[1] + y * this.cellSize,
                    w: this.cellSize,
                    h: this.cellSize,
                    i: (x + y) % 2 === 0 ? 'even' : 'odd',
                    stroke: 'none'
                })
            }
        }
        return cells
    }

    pointIsHoverDarkBox(point) {
        point[0] -= this.margin + this.padding[0]
        point[1] -= this.margin + this.padding[1]

        const col = Math.ceil(point[0] / this.cellSize)
        const row = Math.ceil(point[1] / this.cellSize)
        const isHover = (col + row) % 2 !== 0
        //return isHover
        return this.checkerNum % 2 === 0 ? isHover : !isHover
    }
}
