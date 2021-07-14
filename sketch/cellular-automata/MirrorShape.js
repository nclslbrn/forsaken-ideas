export default class MirrorShape {
    constructor(cols, rows) {
        this.cols = cols
        this.rows = rows
    }
    allCorners(x, y) {
        return [
            [x, y],
            [this.cols * 2 - x, y],
            [x, this.rows * 2 - y],
            [this.cols * 2 - x, this.rows * 2 - y]
        ]
    }
    topLeftCorner(x, y) {
        return [
            [
                [x, y],
                [x + 1, y],
                [x, y + 1]
            ],
            [
                [this.cols * 2 - x, y],
                [this.cols * 2 - x + 1, y],
                [this.cols * 2 - x + 1, y + 1]
            ],
            [
                [x, this.rows * 2 - y],
                [x + 1, this.rows * 2 - y + 1],
                [x, this.rows * 2 - y + 1]
            ],
            [
                [this.cols * 2 - x + 1, this.rows * 2 - y],
                [this.cols * 2 - x + 1, this.rows * 2 - y + 1],
                [this.cols * 2 - x, this.rows * 2 - y + 1]
            ]
        ]
    }
    topRightCorner(x, y) {
        return [
            [
                [x, y],
                [x + 1, y],
                [x + 1, y + 1]
            ],
            [
                [this.cols * 2 - x, y],
                [this.cols * 2 - x + 1, y],
                [this.cols * 2 - x, y + 1]
            ],
            [
                [x, this.rows * 2 - y + 1],
                [x + 1, this.rows * 2 - y],
                [x + 1, this.rows * 2 - y + 1]
            ],
            [
                [this.cols * 2 - x, this.rows * 2 - y],
                [this.cols * 2 - x + 1, this.rows * 2 - y + 1],
                [this.cols * 2 - x, this.rows * 2 - y + 1]
            ]
        ]
    }
    bottomRightCorner(x, y) {
        return [
            [
                [x + 1, y],
                [x + 1, y + 1],
                [x, y + 1]
            ],
            [
                [this.cols * 2 - x, y],
                [this.cols * 2 - x + 1, y + 1],
                [this.cols * 2 - x, y + 1]
            ],
            [
                [x, this.rows * 2 - y],
                [x + 1, this.rows * 2 - y],
                [x + 1, this.rows * 2 - y + 1]
            ],
            [
                [this.cols * 2 - x, this.rows * 2 - y + 1],
                [this.cols * 2 - x, this.rows * 2 - y],
                [this.cols * 2 - x + 1, this.rows * 2 - y]
            ]
        ]
    }
    bottomLeftCorner(x, y) {
        return [
            [
                [x + 1, y + 1],
                [x, y + 1],
                [x, y]
            ],
            [
                [this.cols * 2 - x + 1, y],
                [this.cols * 2 - x + 1, y + 1],
                [this.cols * 2 - x, y + 1]
            ],
            [
                [x, this.rows * 2 - y],
                [x + 1, this.rows * 2 - y],
                [x, this.rows * 2 - y + 1]
            ],
            [
                [this.cols * 2 - x, this.rows * 2 - y],
                [this.cols * 2 - x + 1, this.rows * 2 - y],
                [this.cols * 2 - x + 1, this.rows * 2 - y + 1]
            ]
        ]
    }
}
