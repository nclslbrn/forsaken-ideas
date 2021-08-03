import { randomIntBetween } from './randomBetween'

export default class Walker {
    constructor(
        props = {
            pos: [0, 0],
            distanceBetween: 1,
            step: { min: 1, max: 12 },
            maxDirectionTries: 4,
            limit: [12, 12],
            movingDiagonally: false
        }
    ) {
        this.pos = props.pos
        this.triesWithCrossingAnother = 0
        this.minDistanceBetweenEach = props.minDistanceBetween
        this.maxDirectionTries = props.maxDirectionTries
        this.step = props.step
        this.history = [[...this.pos]]
        this.isStopped = [false, false]
        this.limit = props.limit
        this.movingDiagonally = props.movingDiagonally
    }

    walk(othersWalkers) {
        if (this.isStopped[0] && this.isStopped[1]) {
            return
        }
        const distance = randomIntBetween(this.step)
        const direction = randomIntBetween({ min: 0, max: 3 })
        let isWrongDirection = false
        for (let d = 0; d <= distance && !isWrongDirection; d++) {
            const newPos = this.displace([...this.pos], direction)
            const isCrossing = this.willCrossingAnother(othersWalkers, newPos)
            const isInside = this.isInside(newPos)

            if (!isCrossing && isInside) {
                this.triesWithCrossingAnother = 0
                this.pos = [...newPos]
                this.history.push([...newPos])
            } else {
                if (isWrongDirection && isCrossing) {
                    this.triesWithCrossingAnother++
                    if (
                        this.triesWithCrossingAnother === this.maxDirectionTries
                    ) {
                        if (!this.isStopped[0]) {
                            this.isStopped[0] = true
                            this.triesWithCrossingAnother = 0
                            this.pos = [...this.history[0]]
                            this.history = [...this.history.reverse()]
                        } else {
                            this.isStopped[1] = true
                        }
                    }
                }

                if (isWrongDirection && !isInside) {
                    if (!this.isStopped[0]) {
                        this.isStopped[0] = true
                        this.triesWithCrossingAnother = 0
                        this.pos = [...this.history[0]]
                        this.history = [...this.history.reverse()]
                    } else {
                        this.isStopped[1] = true
                    }
                }

                isWrongDirection = true
            }
        }
    }
    displace(position, direction) {
        if (this.movingDiagonally) {
            switch (direction) {
                case 0:
                    position[0]++
                    position[1]--
                    break
                case 1:
                    position[0]++
                    position[1]++
                    break
                case 2:
                    position[0]--
                    position[1]++
                    break
                case 3:
                    position[0]--
                    position[1]--
                    break
                default:
                    console.error('Unexpected direction')
            }
        } else {
            switch (direction) {
                case 0:
                    position[0]++
                    break
                case 1:
                    position[1]--
                    break
                case 2:
                    position[1]++
                    break
                case 3:
                    position[0]--
                    break
                default:
                    console.error('Unexpected direction')
            }
        }
        return position
    }
    willCrossingAnother(othersWalkers, pos) {
        let isCrossing = false
        for (let w = 0; w < othersWalkers.length && !isCrossing; w++) {
            if (
                othersWalkers[w].history.length > 1 &&
                this.history.length > 1
            ) {
                for (
                    let p = 0;
                    p < othersWalkers[w].history.length && !isCrossing;
                    p++
                ) {
                    const otherPos = othersWalkers[w].history[p]
                    if (
                        Math.abs(pos[0] - otherPos[0]) <
                            this.minDistanceBetweenEach &&
                        Math.abs(pos[1] - otherPos[1]) <
                            this.minDistanceBetweenEach
                    ) {
                        isCrossing = true
                    }
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
