export default class Point {
    constructor(x, y, angle) {
        this.pos = [x, y]
        this.angle = angle
        this.isStuck = false
        this.speed = 1 + Math.random()
        this.onArea = false
    }
}
