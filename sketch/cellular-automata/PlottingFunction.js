export default class PlottingFunction {
    constructor(svg, mirror, cellSize) {
        this.svg = svg
        this.mirror = mirror
        this.cellSize = cellSize
    }

    _d (point) {
        return [point[0] * this.cellSize.w, point[1] * this.cellSize.h]
    }

    fillCell (x, y, color) {
        this.mirror.allCorners(x, y).forEach(() => {
            const pos = this._d([x, y])
            this.svg.rect({
                x: pos.x,
                //y: pos.y,
                w: this.cellSize.w,
                y: this.cellSize.h,
                group: color
            })
        })
    }
    topLeftTriangle (x, y, color) {
        this.mirror.topLeftCorner(x, y).forEach((p) => {
            const points = p.map((pos) => this._d(pos))
            this.svg.triangle({
                points: points,
                group: color
            })
        })
    }
    topRightTriangle (x, y, color) {
        this.mirror.topRightCorner(x, y).forEach((p) => {
            const points = p.map((pos) => this._d(pos))
            this.svg.triangle({
                points: points,
                group: color
            })
        })
    }
    bottomRightTriangle (x, y, color) {
        this.mirror.bottomRightCorner(x, y).forEach((p) => {
            const points = p.map((pos) => this._d(pos))
            this.svg.triangle({
                points: points,
                group: color
            })
        })
    }
    bottomLeftTriangle (x, y, color) {
        this.mirror.bottomLeftCorner(x, y).forEach((p) => {
            const points = p.map((pos) => this._d(pos))
            this.svg.triangle({
                points: points,
                group: color
            })
        })
    }
}
