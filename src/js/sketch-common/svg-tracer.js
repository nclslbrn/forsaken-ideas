/**
 * svgTracer
 *
 * @class
 * @name SvgTracer
 * @classdesc Utility class to create SVG (optimized for Inkscape)
 * @author Nicolas Lebrun
 * @license MIT
 *
 */

export default class SvgTracer {
    /**
     * Setup tracer
     * @constructs
     * @param {Object} options Tracer options
     * @property {object} parentElem - the HTML dom element where include the SVG
     * @property {(('A3_landscape'|'A3_portrait'|'A3_Square'|'A3_topSpiralNotebook'|'A4_landscape'|'A4_portrait'|'P32x24'|'P24x32')|{w: number, h: number})} size - format name listed above or cm {w: width, h: height}
     * @property {number} dpi - resolution 72, 150 or 300
     * @property {string} background - specify color for non white background
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
            console.error("We can't found HTML element where to add the <svg>.")
        }
    }
    /**
     * Create main SVG dom element
     */
    init() {
        if (this.parentElem && this.width && this.height) {
            // html and inksape header (tested only on Debian Inkscape 1.0)
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

            const scaling =
                window.innerWidth > window.innerHeight
                    ? 'max-height: 80vh; width: auto;'
                    : 'max-width: 85vw; height: auto;'
            this.elem.setAttribute(
                'style',
                `${scaling} background: ${this.background}; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);`
            )

            // create an array of group instance (key = group(props.name))
            this.groups = []
            this.parentElem.appendChild(this.elem)
        }
    }
    /**
     * Remove every element in the SVG dom element
     */
    clear() {
        while (this.elem.firstChild) {
            this.elem.removeChild(this.elem.firstChild)
        }
        this.groups = []
    }
    /**
     * Remove everything in groups (dom) elements
     * @param {(string[]|boolean)} groups - (optional) array of specific groups to clear or false (clear all groups)
     */
    clearGroups(groups = false) {
        for (const group_name in this.groups) {
            if (!groups || groups.includes(group_name)) {
                while (this.groups[group_name].firstChild) {
                    this.groups[group_name].removeChild(
                        this.groups[group_name].firstChild
                    )
                }
            }
        }
    }
    /**
     * Add elem to svg group
     * @param {string} group - the group name
     * @param {object} svgItem - the node element (path, circle...) to append
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
     * Drawing a rect
     *
     * @param {Object} rectProps rectangle properties
     * @property {number} x - top left x coordinate of the rectangle
     * @property {number} y - top left y coordinate of the rectangle
     * @property {number} w - width of the rectangle
     * @property {number} h - height of the rectangle
     * @property {string} fill - background color name or color value (HEX, RGB, HSL)
     * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
     * @property {string} group - group name if you want to add rect to a specific group
     */
    rect(rectProps) {
        rectProps.x = rectProps.x === undefined ? 0 : rectProps.x
        rectProps.y = rectProps.y === undefined ? 0 : rectProps.y
        rectProps.w = rectProps.w === undefined ? 0 : rectProps.w
        rectProps.h = rectProps.h === undefined ? 0 : rectProps.h
        rectProps.fill = rectProps.fill === undefined ? false : rectProps.fill
        rectProps.stroke =
            rectProps.stroke === undefined ? false : rectProps.stroke
        rectProps.group =
            rectProps.group === undefined ? false : rectProps.group

        const rect = document.createElementNS(this.namespace.svg, 'rect')

        rect.setAttribute('x', rectProps.x)
        rect.setAttribute('y', rectProps.y)
        rect.setAttribute('width', rectProps.w)
        rect.setAttribute('height', rectProps.h)

        if (rectProps.fill) rect.setAttribute('fill', rectProps.fill)
        if (rectProps.stroke) rect.setAttribute('stroke', rectProps.stroke)

        if (rectProps.group) {
            this.appendToGroup(rectProps.group, rect)
        } else {
            this.elem.appendChild(rect)
        }
    }
    /**
     * Draw a circle
     * @param {Object} circleProps circle properties
     * @property {number} x - x coordinate of the circle center
     * @property {number} y - y coordinate of the circle center
     * @property {number} r - radius of the circle
     * @property {string} fill - background color name or color value (HEX, RGB, HSL)
     * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
     * @property {string} group - group name if you want to add rect to a specific group
     */
    circle(circleProps) {
        circleProps.x = circleProps.x === undefined ? 0 : circleProps.x
        circleProps.y = circleProps.y === undefined ? 0 : circleProps.y
        circleProps.r = circleProps.r === undefined ? 0 : circleProps.r
        circleProps.fill =
            circleProps.fill === undefined ? false : circleProps.fill
        circleProps.stroke =
            circleProps.stroke === undefined ? false : circleProps.stroke
        circleProps.group =
            circleProps.group === undefined ? false : circleProps.group

        const circle = document.createElementNS(this.namespace.svg, 'circle')
        circle.setAttribute('cx', circleProps.x)
        circle.setAttribute('cy', circleProps.y)
        circle.setAttribute('r', circleProps.r)

        if (circleProps.fill) circle.setAttribute('fill', circleProps.fill)
        if (circleProps.stroke)
            circle.setAttribute('stroke', circleProps.stroke)

        if (circleProps.group) {
            this.appendToGroup(circleProps.group, circle)
        } else {
            this.elem.appendChild(circle)
        }
    }
    /**
     * Draw triangle
     * @param {Object} triangleProps triangle properties
     * @property {array} points - two dimensional array (points[n] = [x coordinate, y coordinate])
     * @property {string} fill - background color name or color value (HEX, RGB, HSL)
     * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
     * @property {boolean} close - determine if path is closed or open
     * @property {string} name - a name attribute
     * @property {string} group - group name if you want to add path to a specific group
     */
    triangle(triangleProps) {
        if (triangleProps.points === undefined) {
            console.error(
                'You must specify 3 points in property object to draw a triangle'
            )
            return
        } else {
            if (triangleProps.points.length < 3) {
                console.error(
                    "It seems that triangleProps.points doesn't have three points."
                )
                return
            }
            if (triangleProps.points.length > 3) {
                console.error(
                    'Props.point contains more than 3 coordinates, triangle will only use the three first ones.'
                )
            }
        }
        triangleProps.fill =
            triangleProps.fill === undefined ? false : triangleProps.fill
        triangleProps.stroke =
            triangleProps.stroke === undefined ? false : triangleProps.stroke
        triangleProps.close =
            triangleProps.close === undefined ? false : triangleProps.close
        triangleProps.name =
            triangleProps.name === undefined ? false : triangleProps.name
        triangleProps.group =
            triangleProps.group === undefined ? false : triangleProps.group

        const triangle = document.createElementNS(this.namespace.svg, 'path')
        triangle.setAttribute(
            'd',
            'M ' +
                triangleProps.points[0][0] +
                ',' +
                triangleProps.points[0][1] +
                'L ' +
                triangleProps.points[1][0] +
                ',' +
                triangleProps.points[1][1] +
                'L ' +
                triangleProps.points[2][0] +
                ',' +
                triangleProps.points[2][1] +
                'Z'
        )
        if (triangleProps.fill)
            triangle.setAttribute('fill', triangleProps.fill)
        if (triangleProps.stroke)
            triangle.setAttribute('stroke', triangleProps.stroke)
        if (triangleProps.name)
            triangle.setAttribute('name', triangleProps.name)
        if (triangleProps.group) {
            this.appendToGroup(triangleProps.group, triangle)
        } else {
            this.elem.appendChild(triangle)
        }
    }
    /**
     * Draw line
     * @param {Object} pathProps path properties
     * @property {array} points - two dimensional array (points[n] = [x coordinate, y coordinate])
     * @property {string} fill - background color name or color value (HEX, RGB, HSL)
     * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
     * @property {number} strokeWidth - border width in pixels positive int only
     * @property {boolean} close - determine if path is closed or open
     * @property {string} name - a name attribute
     * @property {string} group - group name if you want to add path to a specific group
     */
    path(pathProps) {
        if (pathProps.points === undefined) {
            console.error('You must specify points coordinates to draw a line')
            return
        }
        pathProps.fill = pathProps.fill === undefined ? false : pathProps.fill
        pathProps.stroke =
            pathProps.stroke === undefined ? false : pathProps.stroke
        pathProps.strokeWidth =
            pathProps.strokeWidth === undefined || Number(pathProps.setAttr) > 1
                ? false
                : pathProps.strokeWidth
        pathProps.close =
            pathProps.close === undefined ? false : pathProps.close
        pathProps.name = pathProps.name === undefined ? false : pathProps.name
        pathProps.group =
            pathProps.group === undefined ? false : pathProps.group

        const path = document.createElementNS(this.namespace.svg, 'path')
        let d = `M ${pathProps.points[0][0]} ${pathProps.points[0][1]}`
        for (let i = 1; i < pathProps.points.length; i++) {
            d += ` L${pathProps.points[i][0]} ${pathProps.points[i][1]}`
        }
        if (pathProps.close)
            d += ` L${pathProps.points[0][0]} ${pathProps.points[0][1]}`
        path.setAttribute('d', d)
        if (pathProps.fill) path.setAttribute('fill', pathProps.fill)
        if (pathProps.stroke) path.setAttribute('stroke', pathProps.stroke)
        if (pathProps.strokeWidth)
            path.setAttribute('stroke-width', pathProps.strokeWidth)
        if (pathProps.name) path.setAttribute('name', pathProps.name)
        if (pathProps.group) {
            this.appendToGroup(pathProps.group, path)
        } else {
            this.elem.appendChild(path)
        }
    }
    /**
     * Draw text
     * @param textProps text properties
     * @property {number} x - top left x coordinate text position
     * @property {number} y - top left y coordinate text position
     * @property {string} text - the text to draw
     * @property {string} fontFamily - font family name of the text
     * @property {number} fontSize - font size of the text
     * @property {string} fill - color of text
     * @property {string} anchor - horizontal alignment (start, middle or end)
     * @property {string} name - a name attribute
     * @property {string} group - group name if you want to add path to a specific group
     */
    text(textProps) {
        if (textProps.x === undefined) {
            console.error('You need to specify x property')
            return
        }
        if (textProps.y === undefined) {
            console.error('You need to specify y property')
            return
        }
        if (textProps.text === undefined) {
            console.error('You need to specify the text that will be displayed')
            return
        }

        textProps.fontFamily =
            textProps.fontFamily === undefined
                ? 'sans-serif'
                : textProps.fontFamily
        textProps.fontSize =
            textProps.fontSize === undefined ? 16 : textProps.fontSize
        textProps.fill = textProps.fill === undefined ? 'black' : textProps.fill
        textProps.anchor =
            textProps.group === undefined ||
            !['start', 'middle', 'end'].includes(textProps.anchor)
                ? false
                : textProps.anchor
        textProps.name = textProps.name === undefined ? false : textProps.name
        textProps.group =
            textProps.group === undefined ? false : textProps.group

        const text = document.createElementNS(this.namespace.svg, 'text')
        text.setAttribute('x', textProps.x)
        text.setAttribute('y', textProps.y)
        text.setAttribute('font-family', textProps.fontFamily)
        text.setAttribute('font-size', textProps.fontSize)
        text.setAttribute('fill', textProps.fill)

        if (textProps.name) text.setAttribute('name', textProps.name)
        if (textProps.anchor) text.setAttribute('text-anchor', textProps.anchor)

        text.innerHTML = textProps.text

        if (textProps.group) {
            this.appendToGroup(textProps.group, text)
        } else {
            this.elem.appendChild(text)
        }
    }
    /**
     * Create group
     * @param {Object} groupProps group properties
     * @property {string} name - an unique group name
     * @property {string} stroke - a stroke color attribute
     * @property {string} strokeWidth - a stroke-width color attribute
     * @property {string} fill - a value of the fill attribute
     * @property {string} group - group name an other group to nest the new one
     * @property {string} id - testing inkscape layer
     */
    group(groupProps) {
        if (groupProps.name === undefined) {
            console.error(
                'You must specified a name because you need it to fill group after created it'
            )
            return
        }
        groupProps.fill =
            groupProps.fill === undefined ? false : groupProps.fill
        groupProps.stroke =
            groupProps.stroke === undefined ? false : groupProps.stroke
        groupProps.group =
            groupProps.group === undefined ? false : groupProps.group
        groupProps.strokeWidth =
            groupProps.strokeWidth === undefined
                ? false
                : groupProps.strokeWidth
        groupProps.id =
            groupProps.id === undefined ? false : 'layer' + groupProps.id

        const groupElem = document.createElementNS(this.namespace.svg, 'g')
        if (groupProps.name) {
            groupElem.setAttribute('name', groupProps.name)
            groupElem.setAttributeNS(
                this.namespace.inkscape,
                'inkscape:label',
                groupProps.name
            )
            groupElem.setAttributeNS(
                this.namespace.inkscape,
                'inkscape:groupmode',
                'layer'
            )
        }
        if (groupProps.id) groupElem.setAttribute('id', groupProps.id)
        if (groupProps.fill) groupElem.setAttribute('fill', groupProps.fill)
        if (groupProps.stroke)
            groupElem.setAttribute('stroke', groupProps.stroke)
        if (groupProps.strokeWidth)
            groupElem.setAttribute('stroke-width', groupProps.strokeWidth)

        if (groupProps.group) {
            this.appendToGroup(groupProps.group, groupElem)
        } else {
            this.elem.appendChild(groupElem)
        }
        this.groups[groupProps.name] = groupElem
    }
    /**
     * Export SVG dom element as file (groups will appear in Inkcape as layers)
     * @param {Object} exportOptions svf export options
     * @property {string} name - filename prefix (will be suffixed by a timestamp)
     */
    export(exportOptions) {
        exportOptions.name =
            exportOptions.name === undefined ? 'untitled' : exportOptions.name
        let svgFile = null
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes()

        const filename = `${exportOptions.name}.${this.size}.${Y}-${m}-${d}_${H}.${i}.svg`
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
     * @param {number} cm cm size to convert
     * @returns {number} px size converted
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
