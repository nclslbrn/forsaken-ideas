export default class Walker {
    constructor(x, y, stop, colour, speed) {
        this.x = x
        this.y = y
        this.stop = stop
        this.colour = colour
        this.speed = speed
    }

    walk() {
        if (!this.stop) {
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    this.x += this.speed
                    break
                case 1:
                    this.y -= this.speed
                    break
                case 2:
                    this.y += this.speed
                    break
                case 3:
                    this.x -= this.speed
                    break
                default:
                    console.log("Unexpected value")
            }
        }
    }
    distance(point) {
        const dx = point.x - this.x
        const dy = point.y - this.y
        return dx * dx + dy * dy
    }
}
