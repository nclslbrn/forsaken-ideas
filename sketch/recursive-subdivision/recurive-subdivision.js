// Based on a processing sketch of Ronik Aufman

import sketch from '../cellular-automata/cellular-automata--ver.vector'

// Value from Inkscape (document properties)
const size = {
    a3: { w: 1587.40157, h: 1122.51969 },
    a4: { w: 1122.51969, h: 793.70079 }
}

const rect = (x, y, w, h) => {}

const subdivision = (w, h, x, y, chanceToSplit, vertical) => {
    if (Math.random() < 0.5) {
    }
}

const recursiveSubdivision = {
    thickness: 4,
    size: size.a4,
    parent: document.getElementById('windowFrame'),
    svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),

    launch: () => {
        sketch.svg.setAttribute('version', '1.1')
        sketch.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        sketch.svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        sketch.svg.setAttribute('width', sketch.size.w)
        sketch.svg.setAttribute('height', sketch.size.h)
        sketch.svg.setAttribute(
            'viewBox',
            `0 0 ${sketch.size.w} ${sketch.size.h}`
        )
        sketch.svg.setAttribute(
            'style',
            'height: 85vh; width: auto; background: #fff; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);'
        )
        sketch.root.appendChild(sketch.svg)
    },

    init: () => {
        subdivision(
            sketch.size.w - sketch.thickness,
            sketch.size.h - sketch.thickness,
            thickness / 2,
            thickness / 2,
            1.0,
            Math.random() < 0.5
        )
    },

    update: () => {},
    export: () => {}
}

export { recursiveSubdivision }
