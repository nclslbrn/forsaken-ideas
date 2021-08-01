import { randomIntBetween } from './randomBetween'

export default class Walker {
    constructor(
        props = {
            pos: [0, 0],
            distanceBetween: 1,
            step: { min: 1, max: 12 },
            maxDirectionTries: 4,
            limit: [12, 12]
        }
    ) {
        this.pos = props.pos
        this.triesWithCrossingAnother = 0
        this.minDistanceBetweenEach = props.distanceBetween
        this.maxDirectionTries = props.maxDirectionTries
        this.step = props.step
        this.history = [this.pos]
        this.isStopped = false
        this.limit = props.limit
    }

    walk(othersWalkers) {
        if (this.isStopped) {
            return
        }

        let newPos = [...this.pos]
        const distance = randomIntBetween(this.step)
        const direction = randomIntBetween({ min: 0, max: 4 })
        for (let d = 0; d < distance; d++) {
            switch (direction) {
                case 0:
                    newPos[0]++
                    break
                case 1:
                    newPos[1]--
                    break
                case 2:
                    newPos[1]++
                    break
                case 3:
                    newPos[0]--
                    break
                default:
                    console.log('Unexpected direction')
            }
            const isCrossing = this.willCrossingAnother(othersWalkers, newPos)
            if (isCrossing) {
                this.triesWithCrossingAnother++
                if (this.triesWithCrossingAnother >= this.maxDirectionTries) {
                    this.isStopped = true
                } else {
                    this.walk(othersWalkers)
                }
            } else {
                if (this.isInside(newPos)) {
                    this.triesWithCrossingAnother = 0
                    this.pos = [...newPos]
                    this.history.push([...newPos])
                } else {
                    this.walk(othersWalkers)
                }
            }
        }
    }

    willCrossingAnother(othersWalkers, pos) {
        let isCrossing = false
        for (let w = 0; w < othersWalkers.length; w++) {
            for (let p = 0; p < othersWalkers[w].history.length; p++) {
                const otherPos = othersWalkers[w].history[p]
                if (
                    Math.abs(pos[0] - otherPos[0]) <
                        this.minDistanceBetweenEach &&
                    Math.abs(pos[1] - otherPos[1]) < this.minDistanceBetweenEach
                ) {
                    isCrossing = true
                }
            }
        }
        return isCrossing
    }

    isInside(pos) {
        if (
            pos[0] >= 0 &&
            pos[0] <= this.limit[0] &&
            pos[1] >= 0 &&
            pos[1] <= this.limit[1]
        ) {
            return true
        } else {
            return false
        }
    }
}
