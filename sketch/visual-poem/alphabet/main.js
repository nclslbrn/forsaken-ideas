/*
 * Alphabet object (each letter as a property)
 * letter an array of path/line
 *
 * Modified version of sam.6"s one
 * @url https://gist.github.com/sam.6/909e0f73d66a0d32b06b17ea77c2959b
 */
import { polyline, asCubic, pathFromCubics, pathFromSvg } from '@thi.ng/geom'
import { lowercase } from './lowercase'
import { uppercase } from './uppercase'
import { ponctuation } from './ponctuation'
import { number } from './number'

const { sin, cos, sqrt, pow, atan2, PI } = Math
// Merge all glyphs into a single object
const alphabet = { ...lowercase, ...uppercase, ...ponctuation, ...number }
/**
 * Main function return an array of path from a key/char
 * @param key {string} a letter/number/ponctuation sign key of alphabet
 * @param size {array} [w,h] size of the glyph
 * @param pos {array} [x,y] position of the glyph (upper left corner)
 * @param rounded {boolean} want straight or rounded glyph
 * @returns {array} of paths [[[line1x1, line1y1], [line1x2, line1y2]...], [[line2x1, line2x2]...]...]
 */
const getGlyph = (key, size, pos, rounded = false) =>
    alphabet.hasOwnProperty(key)
        ? rounded
            ? curvyPathFromGlyph(alphabet[key], size, pos)
            : straightPathFromGlyph(alphabet[key], size, pos)
        : []

// Straight path builder
const straightPathFromGlyph = (glyph, size, pos) => {
    const paths = []
    glyph.forEach((line) =>
        paths.push(...pathFromSvg(
            line.reduce(
                (com, pt, i) =>
                    (com += `${i === 0 ? 'M' : 'L'}${
                        pos[0] + pt[0] * size[0]
                    },${pos[1] + pt[1] * size[1]}`),
                ''
            )
        ))
    )
    return paths
}
// Rounded path builder
const curvyPathFromGlyph = (glyph, size, pos) =>
    glyph.map((line) => {
        const transform = line.map((pt) => [
            pos[0] + pt[0] * size[0],
            pos[1] + pt[1] * size[1]
        ])
        const cubics = asCubic(polyline(transform, { breakpoint: false }))
        const path = pathFromCubics(cubics)
        return path
        /*
        return transform.reduce(
            (com, pt, i, pts) =>
                i === 0
                    ? `M${pt[0]},${pt[1]}`
                    : `${com} ${bezierCommand(pt, i, pts)}`,
            ''
        )
        */
    })

/**
 * Find the properties of the opposed line
 * @param a {array} [x,y] point a coordinate
 * @param b {array} [x,y] point b coordinate
 * @returns {object} {len: number; ang: number} properties of the line ab
 */
const opposedLine = (a, b) => {
    const dx = b[0] - a[0],
        dy = b[1] - a[1]
    return {
        len: sqrt(pow(dx, 2) + pow(dy, 2)),
        ang: atan2(dy, dx)
    }
}

const controlPoint = (curr, prev, next, rev = false) => {
    const p = prev || curr
    const n = next || curr
    const smooth = 0.2
    const l = opposedLine(p, n)
    const ang = l.ang + (rev ? PI : 0)
    const len = l.len * smooth
    return [curr[0] + cos(ang) * len, curr[1] + sin(ang) * len]
}

const bezierCommand = (pt, i, a) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i + 1], pt)
    const [cpeX, cpeY] = controlPoint(pt, a[i - 1], a[i + 1], true)
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${pt[0]},${pt[1]}`
}

export { getGlyph, alphabet }
