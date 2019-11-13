export default class Walker {
    constructor(x, y, stop, colour) {
        this.x = x
        this.y = y
        this.stop = stop
        this.colour = colour
    }

    walk() {
        if (!this.stop) {
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    this.x++
                    break
                case 1:
                    this.y--
                    break
                case 2:
                    this.y++
                    break
                case 3:
                    this.x--
                    break
                default:
                    console.log("Unexpected value")
            }
        }
    }
}
