/**
 * SVG TRACER CLASS
 *
 * Utility class to create <svg> element
 *
 * Availables methods:
 * init: add <svg> in the document (HTML)
 * clear: remove anything in <svg>
 * clearGroups: remove anythings in <svg> <group>
 * appendToGroup; add element to a group
 * rect: add a rectangle
 * circle: add a circle
 * triangle: add a triangle
 * path: add a line
 * text: add text
 * group: add group
 * export: export the whole <svg> markup as file
 *
 * @author Nicolas Lebrun
 * @license MIT
 */

export default class SvgTracer {
    /**
     * Define svg size
     * @typedef {options}
     * @param {object} options.parentElem the HTML dom element where include the SVG
     * @param {string|{x: Number, y: Number}} options.size format name listed above or cm {w: width, h: height}
     * @param {number} options.dpi resolution 72|150|300
     * @param {string} options.background specify color for non white background
     */
    constructor(options) {
        this.parentElem = options.parentElem
        this.dpi = options.dpi === undefined ? 150 : options.dpi
        this.background =
            options.background === undefined ? 'white' : options.background
        this.printFormat = {
            A3_landscape: { w: 42, h: 29.7 },
            A3_portrait: { w: 29.7, h: 42 },
            A3_Square: { w: 29.7, h: 29.7 },
            A3_topSpiralNotebook: { w: 29.7, h: 40.5 },
            A4_landscape: { w: 29.7, h: 21 },
            A4_portrait: { w: 21, h: 29.7 },
            P32x24: { w: 32, h: 24 },
            P24x32: { w: 24, h: 32 }
        }
        this.dpiToPix = {
            72: 30,
            150: 59,
            300: 118
        }
        this.namespace = {
            inkscape: 'http://www.inkscape.org/namespaces/inkscape',
            svg: 'http://www.w3.org/2000/svg'
        }
        this.groups = []
        if (options.parentElem !== undefined) {
            this.parentElem = options.parentElem

            if (
                this.printFormat[options.size] !== undefined ||
                (options.size.w !== undefined && options.size.h !== undefined)
            ) {
                if (this.dpiToPix[this.dpi] !== undefined) {
                    // Custom size
                    if (options.size.w && options.size.h) {
                        this.width = options.size.w * this.dpiToPix[this.dpi]
                        this.height = options.size.h * this.dpiToPix[this.dpi]
                        // CM size
                        this.size = `${options.size.w}x${options.size.h}`
                        this.printSize = options.size
                    }
                    // Referenced print formats
                    else if (this.printFormat[options.size]) {
                        //
                        this.width =
                            this.printFormat[options.size].w *
                            this.dpiToPix[this.dpi]
                        this.height =
                            this.printFormat[options.size].h *
                            this.dpiToPix[this.dpi]
                        // Format name size
                        this.size = options.size
                        this.printSize = this.printFormat[options.size]
                    }
                } else {
                    console.log(
                        'DPI is not set to 72, 150 or 300, we cannot initialize <svg>.'
                    )
                }
            } else {
                console.log(
                    'Wrong format passed, possible options are : ',
                    Object.keys(this.printFormat),
                    ' or custom size object {w: width, h: height}'
                )
            }
        } else {
            console.error('We can found HTML element where to add the <svg>.')
        }
    }
    /**
     * Create SVG element
     */
    init() {
        if (this.parentElem && this.width && this.height) {
            // html and inksape header (tested only on Debian inkscape 1.0)
            this.elem = document.createElementNS(this.namespace.svg, 'svg')
            this.elem.setAttribute('version', '1.1')
            this.elem.setAttribute('xmlns', this.namespace.svg)
            this.elem.setAttribute('xmlns:svg', this.namespace.svg)
            this.elem.setAttribute(
                'xmlns:xlink',
                'http://www.w3.org/1999/xlink'
            )
            this.elem.setAttribute('xmlns:inkscape', this.namespace.inkscape)

            this.elem.setAttribute('width', `${this.printSize.w}cm`)
            this.elem.setAttribute('height', `${this.printSize.h}cm`)
            this.elem.setAttribute(
                'viewBox',
                `0 0 ${this.width} ${this.height}`
            )
            this.elem.setAttribute(
                'style',
                `height: 85vh; width: auto; background: ${this.background}; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);`
            )

            // create an array of group instance (key = group(props.name))
            this.groups = []
            this.parentElem.appendChild(this.elem)
        }
    }
    /**
     * Remove every element in the <svg> element
     */
    clear() {
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.firstChild)
        }
        this.groups = []
    }
    /**
     * Remove everything in <group>s elements
     */
    clearGroups() {
        for (const group_name in this.groups) {
            while (this.groups[group_name].firstChild) {
                this.groups[group_name].removeChild(
                    this.groups[group_name].firstChild
                )
            }
        }
    }
    /**
     * Add elem to svg group
     * @param {string} group the group name
     * @param {node Element} svgItem the element to append
     */
    appendToGroup(group, svgItem) {
        if (this.groups !== undefined || this.groups[group] !== undefined) {
            if (svgItem !== undefined) {
                this.groups[group].appendChild(svgItem)
            } else {
                console.error(
                    "The SVG element is not set, and can't be added to group"
                )
            }
        } else {
            console.error(`Group ${group} doesn't exist.`)
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
     * @param {string} props.group group name if you want to add rect to a specific group
     */
    rect(props) {
        props.x = props.x === undefined ? 0 : props.x
        props.y = props.y === undefined ? 0 : props.y
        props.w = props.w === undefined ? 0 : props.w
        props.h = props.h === undefined ? 0 : props.h
        props.fill = props.fill === undefined ? false : props.fill
        props.stroke = props.stroke === undefined ? false : props.stroke
        props.group = props.group === undefined ? false : props.group
        const rect = document.createElmentNS(this.namespace.svg, 'rect')
        rect.setAttribute('x', props.x)
        rect.setAttribute('y', props.y)
        rect.setAttribute('width', props.w)
        rect.setAttribute('height', props.h)

        if (props.fill) rect.setAttribute('fill', props.fill)
        if (props.stroke) rect.setAttribute('stroke', props.stroke)

        if (props.group) {
            this.groups[props.group].appendChild(rect)
        } else {
            this.elem.appendChild(rect)
        }
    }
    /**
     * Circle drawing function
     * @typedef {circle} props rectangle values
     * @param {number} props.x x coordinate of the circle center
     * @param {number} props.y y coordinate of the circle center
     * @param {number} props.r radius of the circle
     * @param {string} props.fill background color name or color value (HEX, RGB, HSL)
     * @param {string} props.stroke border color name or color value (HEX, RGB, HSL)
     * @param {string} props.group group name if you want to add rect to a specific group
     */
    circle(props) {
        props.x = props.x === undefined ? 0 : props.x
        props.y = props.y === undefined ? 0 : props.y
        props.r = props.r === undefined ? 0 : props.r
        props.fill = props.fill === undefined ? false : props.fill
        props.stroke = props.stroke === undefined ? false : props.stroke
        props.group = props.group === undefined ? false : props.group

        const circle = document.createElmentNS(this.namespace.svg, 'circle')
        circle.setAttribute('cx', props.x)
        circle.setAttribute('cy', props.y)
        circle.setAttribute('r', props.r)

        if (props.fill) circle.setAttribute('fill', props.fill)
        if (props.stroke) circle.setAttribute('stroke', props.stroke)

        if (props.group) {
            this.appendToGroup(props.group, circle)
        } else {
            this.elem.appendChild(circle)
        }
    }
    /**
     * Triangle drawing function
     * @typedef {*} props triangle value
     * @param {array} props.points two dimensional array (points[n] = [x coordinate, y coordinate])
     * @param {string} props.fill background color name or color value (HEX, RGB, HSL)
     * @param {string} props.stroke border color name or color value (HEX, RGB, HSL)
     * @param {boolean} props.close determine if path is closed or open
     * @param {string} props.name a name attribute
     * @param {string} props.group group name if you want to add path to a specific group
     */
    triangle(props) {
        if (props.points === undefined) {
            console.error(
                'You must specify 3 points in property object to draw a triangle'
            )
            return
        } else {
            if (props.points.length < 3) {
                console.error(
                    "It seems that props.points doesn't have three points."
                )
                return
            }
            if (props.points.length > 3) {
                console.error(
                    'Props.point contains more than 3 coordinates, triangle will only use the three first ones.'
                )
            }
        }
        props.fill = props.fill === undefined ? false : props.fill
        props.stroke = props.stroke === undefined ? false : props.stroke
        props.close = props.close === undefined ? false : props.close
        props.name = props.name === undefined ? false : props.name
        props.group = props.group === undefined ? false : props.group

        const triangle = document.createElmentNS(this.namespace.svg, 'path')
        triangle.setAttribute(
            'd',
            'M ' +
                props.points[0][0] +
                ',' +
                props.points[0][1] +
                'L ' +
                props.points[1][0] +
                ',' +
                props.points[1][1] +
                'L ' +
                props.points[2][0] +
                ',' +
                props.points[2][1] +
                'Z'
        )
        if (props.fill) triangle.setAttribute('fill', props.fill)
        if (props.stroke) triangle.setAttribute('stroke', props.stroke)
        if (props.name) triangle.setAttribute('name', props.name)
        if (props.group) {
            this.appendToGroup(props.group, triangle)
        } else {
            this.elem.appendChild(triangle)
        }
    }
    /**
     * Line drawing function
     * @typedef {path} props path value
     * @param {array} props.points two dimensional array (points[n] = [x coordinate, y coordinate])
     * @param {string} props.fill background color name or color value (HEX, RGB, HSL)
     * @param {string} props.stroke border color name or color value (HEX, RGB, HSL)
     * @param {number} props.strokeWidth border width in pixels positive int only
     * @param {boolean} props.close determine if path is closed or open
     * @param {string} props.name a name attribute
     * @param {string} props.group group name if you want to add path to a specific group
     */
    path(props) {
        if (props.points === undefined) {
            console.error('You must specify points coordinates to draw a line')
            return
        }
        props.fill = props.fill === undefined ? false : props.fill
        props.stroke = props.stroke === undefined ? false : props.stroke
        props.strokeWidth =
            props.strokeWidth === undefined || Number(props.setAttr) > 1
                ? false
                : props.strokeWidth
        props.close = props.close === undefined ? false : props.close
        props.name = props.name === undefined ? false : props.name
        props.group = props.group === undefined ? false : props.group

        const path = document.createElementNS(this.namespace.svg, 'path')
        let d = `M ${props.points[0][0]} ${props.points[0][1]}`
        for (let i = 1; i < props.points.length; i++) {
            d += ` L${props.points[i][0]} ${props.points[i][1]}`
        }
        if (props.close) d += ` L${props.points[0][0]} ${props.points[0][1]}`
        path.setAttribute('d', d)
        if (props.fill) path.setAttribute('fill', props.fill)
        if (props.stroke) path.setAttribute('stroke', props.stroke)
        if (props.strokeWidth)
            path.setAttribute('stroke-width', props.strokeWidth)
        if (props.name) path.setAttribute('name', props.name)
        if (props.group) {
            this.appendToGroup(props.group, path)
        } else {
            this.elem.appendChild(path)
        }
    }
    /**
     * Text drawing function
     * @typedef {text} props text dfinition
     * @param {number} props.x top left x coordinate text position
     * @param {number} props.y top left y coordinate text position
     * @param {string} props.text the text to draw
     * @param {string} props.fontFamily font family name of the text
     * @param {number} props.fontSize font size of the text
     * @param {string} props.fill color of text
     * @param {string} props.name a name attribute
     * @param {string} props.group group name if you want to add path to a specific group
     */
    text(props) {
        if (props.x === undefined) {
            console.error('You need to specify x property')
            return
        }
        if (props.y === undefined) {
            console.error('You need to specify y property')
            return
        }
        if (props.text === undefined) {
            console.error('You need to specify the text that will be displayed')
            return
        }
        props.fontFamily =
            props.fontFamily === undefined ? 'sans-serif' : props.fontFamily
        props.fontSize = props.fontSize === undefined ? 16 : props.fontSize
        props.fill = props.fill === undefined ? 'black' : props.fill
        props.name = props.name === undefined ? false : props.name
        props.group = props.group === undefined ? false : props.group

        const text = document.createElementNS(this.namespace.svg, 'text')
        text.setAttribute('x', props.x)
        text.setAttribute('y', props.y)
        text.setAttribute('font-family', props.fontFamily)
        text.setAttribute('font-size', props.fontSize)
        text.setAttribute('fill', props.fill)
        if (props.name) text.setAttribute('name', props.name)
        text.innerHTML = props.text

        if (props.group) {
            this.appendToGroup(props.group, text)
        } else {
            this.elem.appendChild(text)
        }
    }
    /**
     * Group function
     * @typedef {group} props group definition
     * @param {string} props.name an unique group name
     * @param {string} props.stroke a stroke color attribute
     * @param {string} props.strokeWidth a stroke-width color attribute
     * @param {string} props.fill a value of the fill attribute
     * @param {string} props.group group name an other group to nest the new one
     * @param {string} props.id testing inkscape layer
     */
    group(props) {
        if (props.name === undefined) {
            console.error(
                'You must specified a name because you need it to fill group after created it'
            )
            return
        }
        props.fill = props.fill === undefined ? false : props.fill
        props.stroke = props.stroke === undefined ? false : props.stroke
        props.group = props.group === undefined ? false : props.group
        props.strokeWidth =
            props.strokeWidth === undefined ? false : props.strokeWidth
        props.id = props.id === undefined ? false : 'layer' + props.id

        const groupElem = document.createElementNS(this.namespace.svg, 'g')
        if (props.name) {
            groupElem.setAttribute('name', props.name)
            groupElem.setAttributeNS(
                this.namespace.inkscape,
                'inkscape:label',
                props.name
            )
            groupElem.setAttributeNS(
                this.namespace.inkscape,
                'inkscape:groupmode',
                'layer'
            )
        }
        if (props.id) groupElem.setAttribute('id', props.id)
        if (props.fill) groupElem.setAttribute('fill', props.fill)
        if (props.stroke) groupElem.setAttribute('stroke', props.stroke)
        if (props.strokeWidth)
            groupElem.setAttribute('stroke-width', props.strokeWidth)

        if (props.group) {
            this.appendToGroup(props.group, groupElem)
        } else {
            this.elem.appendChild(groupElem)
        }
        this.groups[props.name] = groupElem
    }
    /**
     * Export <svg> as file
     * @typedef {export} props svf file export definition
     * @param {string} props.name filename prefix (will be suffixed by a timestamp)
     */
    export(props) {
        props.name = props.name === undefined ? 'untitled' : props.name
        let svgFile = null
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes()

        const filename = `${props.name}.${this.size}.${Y}-${m}-${d}_${H}.${i}.svg`
        const svgMarkup = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                            ${this.elem.outerHTML}`
        const data = new Blob([svgMarkup], {
            type: 'application/xml' //'text/plain'
        })
        if (svgFile !== null) {
            window.URL.revokeObjectURL(svgFile)
        }
        svgFile = window.URL.createObjectURL(data)

        const link = document.createElement('a')
        link.href = svgFile
        link.download = filename
        link.click()
    }

    /**
     * Convert a centimeter size to pixels from current DPI
     * @param {number} cm to convert
     * @returns {number} px converted
     */
    cmToPixels(cm) {
        if (!isNaN(cm)) {
            return cm * this.dpiToPix[this.dpi]
        } else {
            console.error(
                'The method cmToPixels() must be called with a number in centimeters.'
            )
        }
    }
}
