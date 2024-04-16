/*
 * Alphabet object (each letter as a property)
 * letter an array of path/line
 *
 * Modified version of sam.6"s one
 * @url https://gist.github.com/sam.6/909e0f73d66a0d32b06b17ea77c2959b
 */
// import { polyline, asCubic, pathFromCubics } from '@thi.ng/geom';
import { autoBezierCurve } from '../../../sketch-common/bezierCurve'
import { flattenBezier } from '../flattenBezier'
import { lowercase } from './lowercase'
import { uppercase } from './uppercase'
import { ponctuation } from './ponctuation'
import { number } from './number'

const alphabet = { ...lowercase, ...uppercase, ...ponctuation, ...number }

const getGlyph = key => alphabet.hasOwnProperty(key) ? alphabet[key] : []

const softenGlyph = (glyph) => {
    const smoothed = []
    glyph.forEach((line) => {
        const curved = autoBezierCurve(line, 0.2)
        const converted = flattenBezier(curved)
        const filtered = converted.filter((p) => !isNaN(p[0]) && !isNaN(p[1]) && p[0] !== undefined && p[1] !== undefined)
        smoothed.push(filtered)
    })
}

export { getGlyph, alphabet }
