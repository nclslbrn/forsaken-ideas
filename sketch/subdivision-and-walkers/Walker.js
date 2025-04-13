

export default class Walker {
    constructor(x, y, speed, isIn) {
        this.pos = [x, y]
        this.isStuck = false
        this.speed = speed
        this.hypotSpeed = Math.hypot(speed)
        this.path = []
        this.isIn = isIn
        this.tries = 0
    }

    nextMove() {
        switch (Math.floor(Math.random() * 8)) {
            case 0:
                return [this.pos[0] + this.hypotSpeed, this.pos[1] - this.hypotSpeed]
            case 1:
                return [this.pos[0] + this.speed, this.pos[1]]
            case 2:
                return [this.pos[0] + this.hypotSpeed, this.pos[1] + this.hypotSpeed]
            case 3:
                return [this.pos[0],  this.pos[1] + this.speed]
            case 4:
                return [this.pos[0] - this.hypotSpeed, this.pos[1] + this.hypotSpeed]
            case 5:
                return [this.pos[0] - this.speed, this.pos[1]]
            case 6:
                return [this.pos[0] - this.hypotSpeed, this.pos[1] - this.hypotSpeed]
            case 7:
                return [this.pos[0], this.pos[1] - this.speed]
            default:
                return this.pos
        }
    }

    goToUntilOut(x, y) {
        const dist = Math.hypot(x - this.pos[0], y - this.pos[1])
        const angle = Math.atan2(y - this.pos[1], x - this.pos[0])
        const ln = []

        for (let i = 0; i < dist; i += 0.5) {
            const nx = this.pos[0] + i * Math.cos(angle),
                  ny = this.pos[1] + i * Math.sin(angle)

            if (this.isIn(nx, ny)) {
                ln.push([nx, ny])
            } else {
                return ln
            }
        }
        return ln
    }

    walk(){
        const newPos = this.nextMove()
        if (!this.isStuck && (this.path.length < 2 || this.isIn(...newPos))) {
            const untilOut = this.goToUntilOut(...newPos)
            this.path.push(...untilOut)
            if(untilOut.length) this.pos = untilOut[untilOut.length-1]
        } 
        else { 
            if (this.tries >= 10) this.isStuck = true 
            this.tries++
        }
    }
}
