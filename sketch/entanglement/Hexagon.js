const PI = Math.PI,
    cos = Math.cos,
    sin = Math.sin,
    random = Math.random,
    emptyFaceChance = 0.1

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
        for (let theta = PI * 0.5; theta <= PI * 2.5; theta += PI / 3) {
            points.push([
                this.x + this.r * cos(theta),
                this.y + this.r * sin(theta)
            ])
        }
        return points
    }
    getStrips(lineSpacing) {
        return [
            ...this.getTopSideStrip(lineSpacing),
            ...this.getLeftSideStrip(lineSpacing),
            ...this.getRightSideStrip(lineSpacing)
        ]
    }
    // Top side strip
    getTopSideStrip(lineSpacing) {
        if (random() > emptyFaceChance) {
            if (random() > 0.5) {
                return this.topSideLeftToBottomStrip(lineSpacing)
            } else {
                return this.topSideRightToBottomStrip(lineSpacing)
            }
        } else {
            return []
        }
    }
    topSideLeftToBottomStrip(lineSpacing) {
        const lines = []
        let p1 = {
            x: this.x + this.r * cos(PI * 1.166666),
            y: this.y + this.r * sin(PI * 1.166666)
        }
        let p2 = { x: this.x, y: this.y }
        const angle = PI / 3 - PI * 0.5
        for (let d = 0; d <= this.r / lineSpacing; d++) {
            lines.push([
                [p1.x, p1.y],
                [p2.x, p2.y]
            ])
            p1.x += cos(angle) * lineSpacing
            p2.x += cos(angle) * lineSpacing
            p1.y += sin(angle) * lineSpacing
            p2.y += sin(angle) * lineSpacing
        }
        return lines
    }
    topSideRightToBottomStrip(lineSpacing) {
        const lines = []
        let p1 = { x: this.x, y: this.y - this.r }
        let p2 = {
            x: this.x + this.r * cos(PI * 1.166666),
            y: this.y + this.r * sin(PI * 1.166666)
        }
        const angle = PI * 0.166666667
        for (let d = 0; d <= this.r / lineSpacing; d++) {
            lines.push([
                [p1.x, p1.y],
                [p2.x, p2.y]
            ])
            p1.x += cos(angle) * lineSpacing
            p2.x += cos(angle) * lineSpacing
            p1.y += sin(angle) * lineSpacing
            p2.y += sin(angle) * lineSpacing
        }
        return lines
    }

    // Left side strip
    getLeftSideStrip(lineSpacing) {
        if (random() > emptyFaceChance) {
            if (random() > 0.5) {
                return this.leftSideLeftToTopStripe(lineSpacing)
            } else {
                return this.leftSideTopToBottom(lineSpacing)
            }
        } else {
            return []
        }
    }
    leftSideLeftToTopStripe(lineSpacing) {
        const lines = []
        const p1 = {
            x: this.x + this.r * cos(PI * 0.5),
            y: this.y + this.r * sin(PI * 0.5)
        }
        const p2 = {
            x: p1.x + this.r * cos(PI * -0.833),
            y: p1.y + this.r * sin(PI * -0.833)
        }
        for (let h = this.r; h >= 0; h -= lineSpacing) {
            lines.push([
                [p1.x, p1.y - h],
                [p2.x, p2.y - h]
            ])
        }
        return lines
    }
    leftSideTopToBottom(lineSpacing) {
        const lines = []
        const angle = PI * 0.16666
        let p1 = {
            x: this.x + this.r * cos(PI * -0.833),
            y: this.y + this.r * sin(PI * -0.833)
        }
        let p2 = {
            x: this.x + this.r * cos(PI * 0.8333),
            y: this.y + this.r * sin(PI * 0.8333)
        }
        for (let h = 0; h <= this.r; h += lineSpacing) {
            lines.push([
                [p1.x, p1.y],
                [p2.x, p2.y]
            ])

            p1.x += cos(angle) * lineSpacing
            p2.x += cos(angle) * lineSpacing
            p1.y += sin(angle) * lineSpacing
            p2.y += sin(angle) * lineSpacing
        }
        return lines
    }
    // Right side strip
    getRightSideStrip(lineSpacing) {
        if (random() > emptyFaceChance) {
            if (random() > 0.5) {
                return this.rightSideLeftToTopStrip(lineSpacing)
            } else {
                return this.rightSideTopToBottomStrip(lineSpacing)
            }
        } else {
            return []
        }
    }
    rightSideLeftToTopStrip(lineSpacing) {
        const lines = []
        const p1 = { x: this.x, y: this.y }
        const p2 = {
            x: this.x + this.r * cos(PI * -0.166666),
            y: this.y + this.r * sin(PI * -0.166666)
        }
        for (let h = 0; h <= this.r; h += lineSpacing) {
            lines.push([
                [p1.x, p1.y + h],
                [p2.x, p2.y + h]
            ])
        }
        return lines
    }
    rightSideTopToBottomStrip(lineSpacing) {
        const lines = []
        const angle = PI * -0.16666
        let p1 = {
            x: this.x,
            y: this.y
        }
        let p2 = {
            x: this.x,
            y: this.y + this.r
        }
        for (let h = 0; h <= this.r; h += lineSpacing) {
            lines.push([
                [p1.x, p1.y],
                [p2.x, p2.y]
            ])

            p1.x += cos(angle) * lineSpacing
            p2.x += cos(angle) * lineSpacing
            p1.y += sin(angle) * lineSpacing
            p2.y += sin(angle) * lineSpacing
        }
        return lines
    }
}
