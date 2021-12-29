export default class Subdivision {
    /**
     *
     * @param {object} props
     * @property {number} baseSize factor of cell division + margin
     * @property {number} firstCellWidth initial grid width
     * @property {number} firstCellHeight initial grid height
     */
    constructor(props = {}) {
        if (props.baseSize) {
            this.baseSize = props.baseSize
        } else {
            console.warn('You must specified baseSize.')
            this.baseSize = 0.01
        }

        if (props.firstCellWidth && props.firstCellHeight) {
            this.initSize = {
                w: props.firstCellWidth,
                h: props.firstCellHeight
            }
        }

        this.cells = []
    }
    /**
     * Reset grid as a single cell
     */
    init() {
        this.cells = [
            /**
             * @param {object} cell
             * @property {number} w the width of the cell
             * @property {number} h the height of the cell
             * @property {number} x the horizontal position of the upper left corner of the cell
             * @property {number} y the vertical position of the upper left corner of the cell
             * @property {number} depth the number of division to create the cell
             * @property {number} dir 0|1 the direction of the last division 0 for x 1 for y
             */
            {
                w: this.initSize.w - this.baseSize * 2,
                h: this.initSize.h - this.baseSize * 2,
                x: this.baseSize,
                y: this.baseSize,
                depth: 0,
                dir: null
            }
        ]
    }
    /**
     * Subdivide grid
     * @param {object} cellIndex the cell to divide
     */
    subdivide() {
        const cellIndex = Math.floor(Math.random() * this.cells.length)
        const cell = { ...this.cells[cellIndex] }
        if (cell.w > this.baseSize * 4 && cell.h > this.baseSize * 4) {
            this.cells.splice(cellIndex, 1)
            const isVerticalSplit = Math.random() > 0.5

            let at
            if (isVerticalSplit) {
                const dx = this.randomBetween(cell.w)
                this.splitOnX(cell, dx)
                at = String(dx + '/' + cell.w)
            } else {
                const dy = this.randomBetween(cell.h)
                this.splitOnY(cell, dy)
                at = String(dy + '/' + cell.h)
            }
        }
        // console.log('splitted on ', isVerticalSplit ? 'x' : 'y', ' at ', at)
    }
    splitOnX(cell, dx) {
        this.cells.push(
            ...[
                {
                    x: cell.x,
                    y: cell.y,
                    w: dx - this.baseSize,
                    h: cell.h,
                    depth: cell.depth + 1,
                    dir: 0
                },
                {
                    x: cell.x + dx + this.baseSize,
                    y: cell.y,
                    w: cell.w - dx - this.baseSize,
                    h: cell.h,
                    depth: cell.depth + 1,
                    dir: 0
                }
            ]
        )
    }
    splitOnY(cell, dy) {
        this.cells.push(
            ...[
                {
                    x: cell.x,
                    y: cell.y,
                    w: cell.w,
                    h: dy - this.baseSize,
                    depth: cell.depth + 1,
                    dir: 1
                },
                {
                    x: cell.x,
                    y: cell.y + dy + this.baseSize,
                    w: cell.w,
                    h: cell.h - dy - this.baseSize,
                    depth: cell.depth + 1,
                    dir: 1
                }
            ]
        )
    }
    randomBetween = (size) => {
        const numParts = Math.floor(size / this.baseSize)
        const split =
            Math.floor(2 + Math.random() * (numParts - 4)) * this.baseSize
        return split
    }
}
