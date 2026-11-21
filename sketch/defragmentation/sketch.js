import {
    area,
    asSvg,
    bounds,
    clipConvex,
    group,
    line,
    polygon,
    polyline,
    rect,
    resample,
    svgDoc
} from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'
import { SYSTEM } from '@thi.ng/random'
import { convert, mul, quantity, NONE, cm, dpi } from '@thi.ng/units'
import { downloadWithMime } from '@thi.ng/dl-asset'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import {
    add2,
    mulN2,
    normalize2,
    perpendicularCCW,
    sub2
} from '@thi.ng/vectors'
import { createNoise2D } from 'simplex-noise'
import dashLine from './dashLine'

const APP = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    DPI = quantity(72, dpi),
    CSTM_FORMAT = quantity([35, 35], cm),
    SIZE = mul(CSTM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(3, cm), DPI), NONE),
    BIG = Math.hypot(...SIZE) * 2,
    I = 18,
    STYLES = 6,
    lineStep = 6,
    lineWeight = 1.5,
    bgColor = '#e4c4c4',
    simplex = createNoise2D(),
    noiseLine = (pts) => {
        const freq = 0.0007
        const turbulence = 15
        const force = 6
        return pts.map((pt) => {
            const nValue = turbulence * simplex(pt[0] * freq, pt[1] * freq)
            return [
                pt[0] + Math.cos(nValue) * force,
                pt[1] + Math.sin(nValue) * force
            ]
        })
    }

let N, parts, drawing
APP.appendChild(CANVAS)
CANVAS.width = SIZE[0]
CANVAS.height = SIZE[1]

/**
 * Create a part with a fixed hatch style, so it doesn't change on each render.
 */
const newPart = (pts, index) =>
    polygon(pts, { index, style: SYSTEM.int() % STYLES })

/**
 * Split a convex polygon in two along the infinite line a-b, by clipping it
 * against each half-plane. Returns undefined if the line misses the polygon.
 */
const splitPart = (part, a, b) => {
    const dir = mulN2(null, normalize2([], sub2([], b, a)), BIG)
    const p = sub2([], a, dir)
    const q = add2([], b, dir)
    const halves = [1, -1].map((side) => {
        const off = mulN2(null, perpendicularCCW([], dir), side)
        return clipConvex(part, [p, q, add2([], q, off), add2([], p, off)])?.[0]
    })
    return halves.every((h) => h && area(h) > 1) ? halves : undefined
}

const cutTile = () => {
    const isVertical = SYSTEM.float() > 0.5
    const a = isVertical
        ? [Math.round(SYSTEM.float(SIZE[0])), MARGIN / 2]
        : [MARGIN / 2, Math.round(SYSTEM.float(SIZE[1]))]
    const b = isVertical
        ? [Math.round(SYSTEM.float(SIZE[0])), SIZE[1] - MARGIN / 2]
        : [SIZE[0] - MARGIN / 2, Math.round(SYSTEM.float(SIZE[1]))]

    parts = parts.flatMap((part) => {
        const halves = splitPart(part, a, b)
        return halves
            ? halves.map((h, k) =>
                  newPart(h.points, part.attribs.index + k + 1)
              )
            : [part]
    })
}

// join hatch lines into one continuous path (boustrophedon) → fewer pen lifts
const serpentine = (segs) =>
    segs.flatMap((s, i) => (i % 2 ? [...s].reverse() : s))

// add points along the line so the noise actually bends it
const wavy = (pts) => noiseLine(resample(polyline(pts), { dist: 4 }).points)

const hatchPart = (part) => {
    const { index, style } = part.attribs
    const { pos, size } = bounds(part)
    const max = add2([], pos, size)
    const lines = []
    if (index % 2) {
        for (let x = pos[0]; x <= max[0]; x += lineStep)
            lines.push(line([x, pos[1]], [x, max[1]]))
    } else {
        for (let y = pos[1]; y <= max[1]; y += lineStep)
            lines.push(line([pos[0], y], [max[0], y]))
    }
    const segs = lines
        .map((l) => clipConvex(l, part)?.[0]?.points)
        .filter(Boolean)
    if (!segs.length) return []

    switch (style) {
        // dash noise
        case 0:
            return segs.flatMap((s) =>
                dashLine(s, 128, index % 2).map((d) => wavy(d))
            )
        // full noise, one continuous path
        case 1:
            return [wavy(serpentine(segs))]
        // uniform dash straight
        case 2:
            return segs.flatMap((s) => dashLine(s, 512, 0))
        // random dash straight
        case 3:
            return segs.flatMap((s) => dashLine(s, 256, 1))
        // empty
        case 4:
            return []
        // straight lines, one continuous path
        case 5:
            return [serpentine(segs)]
        // part without style (shouldn't happen): plain hatch
        default:
            return segs
    }
}

const render = () => {
    drawing = group(
        { stroke: '#5a4869', weight: lineWeight, fill: 'none' },
        parts
            .flatMap(hatchPart)
            .filter((pts) => pts && pts.length > 1)
            .map((pts) => polyline(pts))
    )

    draw(
        CTX,
        group({ __inkscapeLayer: 'Composition' }, [
            rect(SIZE, { fill: bgColor }),
            drawing
        ])
    )
}

const sketch = {
    // reset value and relaunch drawing
    init: () => {
        N = Math.ceil(SYSTEM.float(3)) || 1
        const tileSize = [
            Math.round((SIZE[0] - MARGIN * 2) / N),
            Math.round((SIZE[1] - MARGIN * 2) / N)
        ]
        parts = []
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                const x0 = MARGIN + x * tileSize[0],
                    y0 = MARGIN + y * tileSize[1],
                    x1 = x0 + tileSize[0],
                    y1 = y0 + tileSize[1]
                parts.push(
                    newPart(
                        [
                            [x0, y0],
                            [x1, y0],
                            [x1, y1],
                            [x0, y1]
                        ],
                        (x + y) % 2
                    )
                )
            }
        }
        for (let i = 0; i < I; i++) cutTile()
        render()
    },
    // add one more cut
    fold: () => {
        cutTile()
        render()
    },
    // export drawing as SVG file
    export: () => {
        downloadWithMime(
            `Defragmentation - ${FMT_yyyyMMdd_HHmmss()}.svg`,
            asSvg(
                svgDoc(
                    {
                        width: SIZE[0],
                        height: SIZE[1],
                        viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                    },
                    drawing
                )
            )
        )
    }
}

export default sketch
