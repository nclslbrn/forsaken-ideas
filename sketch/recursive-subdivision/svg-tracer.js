/**
 * SVG TRACER
 *
 * Shorthand create svg dom element function
 */

// Define main SVG width, height & viewBox
const printFormat = {
    a3: { w: 1587.40157, h: 1122.51969 },
    a3Square: { w: 1122.51969, h: 1122.51969 },
    a4: { w: 1122.51969, h: 793.70079 },
    a4Square: { w: 793.70079, h: 793.70079 }
}

export default class SvgTracer {
    /**
     * Define svg size
     * @param {object} parentElem the HTML dom element where include the SVG
     * @param {string} size one of printFormat's key
     */
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
    /**
     * Create SVG element
     */
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
    /**
     * Remove every element in SVG element
     */
    clear() {
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.firstChild)
        }
    }
    /**
     * Rect drawing function
     * @typedef {rect} props rectangle values
     * @param {number} props.x top left x coordinate of the rectangle
     * @param {number} props.y top left y coordinate of the rectangle
     * @param {number} props.w width of the rectangle
     * @param {number} props.h height of the rectangle
     * @param {string} props.fill background color name or color value (HEX, RGB, HSL)
     * @param {string} props.stroke border color name or color value (HEX, RGB, HSL)
     */
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
    /**
     * Line drawing function
     * @typedef {line} props line value
     * @param {array} props.points two dimensional array (points[n] = [x coordinate, y coordinate])
     * @param {string} props.fill background color name or color value (HEX, RGB, HSL)
     * @param {string} props.stroke border color name or color value (HEX, RGB, HSL)
     */
    line(props = { points: [], fill: false, stroke: false }) {
        const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        let d = `M ${props.points[0][0]} ${props.points[0][1]}`

        for (let i = 1; i < props.points.length; i++) {
            d += ` L${props.points[i][0]} ${props.points[i][1]}`
        }
        path.setAttribute('d', d)
        if (props.fill) path.setAttribute('fill', props.fill)
        if (props.stroke) path.setAttribute('stroke', props.stroke)
        this.elem.appendChild(path)
    }
    /**
     * Text drawing function
     * @typedef {text} props text dfinition
     * @param {number} props.x top left x coordinate text position
     * @param {number} props.y top left y coordinate text position
     * @param {string} props.text the text to draw
     * @param {string} props.fontFamily font family name of the text
     * @param {number} props.fontSize font size of the text
     */
    text(
        props = { x: 0, y: 0, text: '', fontFamily: 'sans-serif', fontSize: 16 }
    ) {
        const text = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
        )
        text.setAttribute('x', props.x)
        text.setAttribute('y', props.y)
        text.setAttribute('font-family', props.fontFamily)
        text.setAttribute('font-size', props.frontSize)
        text.innerText = props.text
        this.elem.appendChild(text)
    }
}
