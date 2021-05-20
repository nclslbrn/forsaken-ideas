export default class Strip {
    constructor(options) {
        const length = { min: 64, max: 256 }
        const width = { min: 2, max: 128 }
        this.color = options.color
        this.radius = options.radius
        this.startAngle = options.startAngle
        this.angle = options.angle
        this.steps =
            Math.floor(Math.random() * (length.max - length.min)) + length.min
        this.width =
            Math.floor(Math.random() * (width.max - width.min)) + width.min
    }

    getPoints() {
        const points = []
        for (
            let theta = 0;
            theta < this.angle;
            theta += this.angle / this.steps
        ) {
            const lines = []
            lines[0] = {
                x:
                    (this.radius + this.width) *
                    Math.cos(this.startAngle + theta),
                y:
                    (this.radius + this.width) *
                    Math.sin(this.startAngle + theta)
            }
            lines[1] = {
                x: this.radius * Math.cos(this.startAngle + theta),
                y: this.radius * Math.sin(this.startAngle + theta)
            }
            points.push(lines)
        }
        return points
    }
}
