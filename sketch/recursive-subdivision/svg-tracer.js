const printFormat = {
    a3: { w: 1587.40157, h: 1122.51969 },
    a4: { w: 1122.51969, h: 793.70079 }
}

export default class SvgTracer {
    constructor(parentElem, size) {
        this.parentElem = parentElem

        if (printFormat[size] == undefined) {
            console.log(
                'Wrong format passed, possible options are : ',
                Object.keys(printFormat)
            )
            return
        } else {
            this.width = printFormat[size].w
            this.height = printFormat[size].h
        }
    }

    init() {
        if (this.parentElem && this.width && this.height) {
            this.elem = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            )
            this.elem.setAttribute('version', '1.1')
            this.elem.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            this.elem.setAttribute(
                'xmlns:xlink',
                'http://www.w3.org/1999/xlink'
            )
            this.elem.setAttribute('width', this.width)
            this.elem.setAttribute('height', this.height)
            this.elem.setAttribute(
                'viewBox',
                `0 0 ${this.width} ${this.height}`
            )
            this.elem.setAttribute(
                'style',
                'height: 85vh; width: auto; background: #fff; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);'
            )
            this.parentElem.appendChild(this.elem)
        }
    }
    clear() {
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.firstChild)
        }
    }
    rect(props = { x: 0, y: 0, w: 0, h: 0, fill: false, stroke: false }) {
        const rect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect'
        )
        rect.setAttribute('x', props.x)
        rect.setAttribute('y', props.y)
        rect.setAttribute('width', props.w)
        rect.setAttribute('height', props.h)

        if (props.fill) rect.setAttribute('fill', props.fill)
        if (props.stroke) rect.setAttribute('stroke', props.stroke)

        this.elem.appendChild(rect)
    }

    line(props = { points: [], fill: false, stroke: false }) {}
}
