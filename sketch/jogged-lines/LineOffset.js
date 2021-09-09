import isCCW from './isCCW'

export default class LineOffset {
    constructor(
        props = {
            line: [],
            offsetCount: 1,
            isDiagComp: false,
            offsetWidth: 2,
            tracer: null
        }
    ) {
        this.line = props.line
        this.offsetCount = props.offsetCount
        this.isDiagComp = props.isDiagComp
        this.offsetWidth = props.offsetWidth
        this.isCCW = isCCW(props.line)
        this.color = this.isCCW ? 0 : 1
        this.distance = props.offsetWidth / this.offsetCount
        this.tracer = props.tracer
    }

    getOffsets() {
        let offsetId = 0,
            previousAngle,
            previousPos

        const offsets = {
            lines: [],
            color: this.color
        }
        const rot = this.isDiagComp ? Math.PI * 0.5 : Math.PI * 0.25

        for (
            let d = -this.offsetWidth / 2;
            d <= this.offsetWidth / 2;
            d += this.distance
        ) {
            offsets.lines[offsetId] = []

            for (let p1 = 0; p1 < this.line.length; p1++) {
                const p2 = p1 !== this.line.length - 1 ? p1 + 1 : 0
                //const p3 = p2 !== this.line.length - 1 ? p2 + 1 : 0
                const dx = this.line[p2][0] - this.line[p1][0]
                const dy = this.line[p2][1] - this.line[p1][1]
                const angle = Math.atan2(dy, dx)

                if (previousAngle - angle > Math.PI) {
                    this.isInward = !this.isInward
                }
                const pos = [
                    this.line[p1][0] + d * Math.cos(rot),
                    this.line[p1][1] + d * Math.sin(rot)
                ]
                offsets.lines[offsetId].push(pos)
                previousAngle = angle
                previousPos = pos
            }
            offsetId++
        }
        return offsets
    }
}
