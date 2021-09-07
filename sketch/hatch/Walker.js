import { randomIntBetween } from './randomBetween'

export default class Walker {
    constructor(
        props = {
            pos: [0, 0],
            step: { min: 1, max: 12 },
            maxDirectionTries: 4,
            limit: [12, 12],
            movingDiagonally: false
        }
    ) {
        this.pos = props.pos
        this.failedDisplacementsTries = 0
        this.maxDirectionTries = props.maxDirectionTries
        this.step = props.step
        this.history = [[...this.pos]]
        this.isStopped = [false, false]
        this.limit = props.limit
        this.movingDiagonally = props.movingDiagonally
    }

    walk(othersWalkers) {
        if (!this.isStopped[1]) {
            const distance = randomIntBetween(this.step)
            const direction = randomIntBetween({ min: 0, max: 3 })

            let isWrongDirection = false,
                d = 0
            while (d <= distance && !isWrongDirection) {
                const newPos = this.displace([...this.pos], direction)

                const isHoverAnother = this.willCrossingAnother(
                    othersWalkers,
                    newPos
                )
                const isInside = this.isInside(newPos)

                // Everything is fine
                if (!isHoverAnother && isInside) {
                    this.failedDisplacementsTries = 0
                    this.pos = [...newPos]
                    this.history.push([...newPos])
                }
                // Walker is in a wrong way ...
                else {
                    if (isHoverAnother || !isInside) {
                        this.failedDisplacementsTries++

                        // for too long
                        if (
                            this.failedDisplacementsTries ===
                            this.maxDirectionTries
                        ) {
                            if (this.isStopped[0]) {
                                // Definitively stuck
                                this.isStopped[1] = true
                            }
                            // stuck in the first path
                            else {
                                // revert path order (filo lifo)
                                this.pos = [...this.history[0]]
                                this.history = [...this.history.reverse()]
                                this.isStopped[0] = true
                                this.failedDisplacementsTries = 0
                            }
                        }
                    }
                }
                d++
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
                        Math.abs(otherPos[0] - pos[0]) === 0 &&
                        Math.abs(otherPos[1] - pos[1]) === 0
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
            pos[0] > 0 &&
            pos[0] < this.limit[0] &&
            pos[1] > 0 &&
            pos[1] < this.limit[1]
        ) {
            return true
        } else {
            return false
        }
    }
    isStuck() {
        return this.isStopped[1]
    }
}
