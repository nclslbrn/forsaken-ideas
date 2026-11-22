/*
 * Radom walker class
 *
 * @param {array} pos initial x and y position
 * @param {number} speed walker amplitude
 * @param {function} isIn determine which move keep or retry (arg [x, y])
 * @param {number} closePathLimit a minimal distance to stop the walker (from its initial position)
 * @param {function} rand peudo radom number [0-1]
 */
export default class Walker {
    constructor([x, y], speed, isIn, minCloseDistance, rand) {
        this.pos = [x, y]
        this.isStuck = false
        this.speed = speed
        this.hypotSpeed = Math.hypot(speed)
        this.minCloseDistance = minCloseDistance
        this.isIn = isIn
        this.rand = rand
        this.path = []
        this.tries = 0

        console.log('rand', this.rand())
    }

    nextMove() {
        switch (Math.floor(this.rand() * 8)) {
            case 0:
                return [
                    this.pos[0] + this.hypotSpeed,
                    this.pos[1] - this.hypotSpeed
                ]
            case 1:
                return [this.pos[0] + this.speed, this.pos[1]]
            case 2:
                return [
                    this.pos[0] + this.hypotSpeed,
                    this.pos[1] + this.hypotSpeed
                ]
            case 3:
                return [this.pos[0], this.pos[1] + this.speed]
            case 4:
                return [
                    this.pos[0] - this.hypotSpeed,
                    this.pos[1] + this.hypotSpeed
                ]
            case 5:
                return [this.pos[0] - this.speed, this.pos[1]]
            case 6:
                return [
                    this.pos[0] - this.hypotSpeed,
                    this.pos[1] - this.hypotSpeed
                ]
            case 7:
                return [this.pos[0], this.pos[1] - this.speed]
            default:
                return this.pos
        }
    }

    shouldClosePath([x, y]) {
        // Not enough point to close
        if (this.path.length < 1) return false

        // Compute distance between last point and initial position
        const distance = Math.hypot(this.path[0][0] - x, this.path[0][1] - y)
        return distance <= this.minCloseDistance ? true : false
    }

    goToUntilOut([x, y]) {
        const dist = Math.hypot(x - this.pos[0], y - this.pos[1])
        const angle = Math.atan2(y - this.pos[1], x - this.pos[0])
        const ln = []

        for (let i = 0; i < dist; i += 8) {
            const nx = this.pos[0] + i * Math.cos(angle),
                ny = this.pos[1] + i * Math.sin(angle)

            if (this.isIn([nx, ny])) {
                ln.push([nx, ny])
                const isPathEnd = this.shouldClosePath([nx, ny])
                if (isPathEnd) {
                    this.isStuck = true
                    return ln
                }
            } else {
                return ln
            }
        }
        return ln
    }

    walk() {
        if (!this.isStuck) {
            const newPos = this.nextMove()
            const untilOut = this.goToUntilOut(newPos)
            this.path.push(...untilOut)
        } else {
            this.walk()
        }
    }
}
