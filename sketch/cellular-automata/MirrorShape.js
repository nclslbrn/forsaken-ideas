export default class MirrorShape {
    constructor(cols, rows) {
        this.cols = cols
        this.rows = rows
    }
    allCorners(x, y) {
        return [
            [x, y],
            [this.cols + this.cols - x, y],
            [x, this.rows + this.rows - y],
            [this.cols + this.cols - x, this.rows + this.rows - y]
        ]
    }
    topLeftCorner(x, y) {
        return [
            [x, y, x + 1, y, x, y + 1],
            [
                this.cols + this.cols - x,
                y,
                this.cols + this.cols - x + 1,
                y,
                this.cols + this.cols - x + 1,
                y + 1
            ],
            [
                x,
                this.rows + this.rows - y,
                x + 1,
                this.rows + this.rows - y + 1,
                x,
                this.rows + this.rows - y + 1
            ],
            [
                this.cols + this.cols - x + 1,
                this.rows + this.rows - y,
                this.cols + this.cols - x + 1,
                this.rows + this.rows - y + 1,
                this.cols + this.cols - x,
                this.rows + this.rows - y + 1
            ]
        ]
    }
    topRightCorner(x, y) {
        return [
            [x, y, x + 1, y, x + 1, y + 1],
            [
                this.cols + this.cols - x,
                y,
                this.cols + this.cols - x + 1,
                y,
                this.cols + this.cols - x,
                y + 1
            ],
            [
                x,
                this.rows + this.rows - y + 1,
                x + 1,
                this.rows + this.rows - y,
                x + 1,
                this.rows + this.rows - y + 1
            ],
            [
                this.cols + this.cols - x,
                this.rows + this.rows - y,
                this.cols + this.cols - x + 1,
                this.rows + this.rows - y + 1,
                this.cols + this.cols - x,
                this.rows + this.rows - y + 1
            ]
        ]
    }
    bottomRightCorner(x, y) {
        return [
            [x + 1, y, x + 1, y + 1, x, y + 1],
            [
                this.cols + this.cols - x,
                y,
                this.cols + this.cols - x + 1,
                y + 1,
                this.cols + this.cols - x,
                y + 1
            ],
            [
                x,
                this.rows + this.rows - y,
                x + 1,
                this.rows + this.rows - y,
                x + 1,
                this.rows + this.rows - y + 1
            ],
            [
                this.cols + this.cols - x,
                this.rows + this.rows - y + 1,
                this.cols + this.cols - x,
                this.rows + this.rows - y,
                this.cols + this.cols - x + 1,
                this.rows + this.rows - y
            ]
        ]
    }
    bottomLeftCorner(x, y) {
        return [
            [x + 1, y + 1, x, y + 1, x, y],
            [
                this.cols + this.cols - x + 1,
                y,
                this.cols + this.cols - x + 1,
                y + 1,
                this.cols + this.cols - x,
                y + 1,
                this.cols + this.cols - x,
                this.rows + this.rows - y
            ],
            [
                x,
                this.rows + this.rows - y,
                x + 1,
                this.rows + this.rows - y,
                x,
                this.rows + this.rows - y + 1
            ],
            [
                this.cols + this.cols - x,
                this.rows + this.rows - y,
                this.cols + this.cols - x + 1,
                this.rows + this.rows - y,
                this.cols + this.cols - x + 1,
                this.rows + this.rows - y + 1
            ]
        ]
    }
}
