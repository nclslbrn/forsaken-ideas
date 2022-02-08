export default class Hexagon {
    constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
    }

    isPointInsideHex(point) {
        const dx = Math.abs(point.x - this.x) / (this.r * 2)
        const dy = Math.abs(point.y - this.y) / (this.r * 2)
        const a = 0.25 * Math.sqrt(3.0)
        return dx <= a && a * dy + 0.25 * dx <= 0.5 * a
    }

    getContour() {
        let points = []
        for (
            let theta = Math.PI * 0.5;
            theta <= Math.PI * 2.5;
            theta += Math.PI / 3
        ) {
            points.push([
                this.x + this.r * Math.cos(theta),
                this.y + this.r * Math.sin(theta)
            ])
        }
        return points
    }
    getStripe(lineSpacing) {
        return [
            ...this.getTopSideStrip(lineSpacing),
            ...this.getLeftSideStrip(lineSpacing),
            ...this.getRightSideStrip(lineSpacing)
        ]
    }
    getTopSideStrip(lineSpacing) {
        let p1 = {
            x: this.x + this.r * Math.cos(Math.PI * 1.166666),
            y: this.y + this.r * Math.sin(Math.PI * 1.166666)
        }
        let p2 = { x: this.x, y: this.y }
        const lines = []
        for (let d = 0; d <= this.r / lineSpacing; d++) {
            const angle = Math.PI / 3 - Math.PI * 0.5
            lines.push([
                [p1.x, p1.y],
                [p2.x, p2.y]
            ])
            p1.x += Math.cos(angle) * lineSpacing
            p2.x += Math.cos(angle) * lineSpacing
            p1.y += Math.sin(angle) * lineSpacing
            p2.y += Math.sin(angle) * lineSpacing
        }
        return lines
    }

    getLeftSideStrip(lineSpacing) {
        const p1 = {
            x: this.x + this.r * Math.cos(Math.PI * 0.5),
            y: this.y + this.r * Math.sin(Math.PI * 0.5)
        }
        const p2 = {
            x: p1.x + this.r * Math.cos(Math.PI * -0.833),
            y: p1.y + this.r * Math.sin(Math.PI * -0.833)
        }
        const lines = []
        for (let h = this.r; h >= 0; h -= lineSpacing) {
            lines.push([
                [p1.x, p1.y - h],
                [p2.x, p2.y - h]
            ])
        }
        return lines
    }

    getRightSideStrip(lineSpacing) {
        const p1 = { x: this.x, y: this.y }
        const p2 = {
            x: this.x + this.r * Math.cos(Math.PI * -0.166666),
            y: this.y + this.r * Math.sin(Math.PI * -0.166666)
        }
        const lines = []
        for (let h = 0; h <= this.r; h += lineSpacing) {
            lines.push([
                [p1.x, p1.y + h],
                [p2.x, p2.y + h]
            ])
        }
        return lines
    }
}
