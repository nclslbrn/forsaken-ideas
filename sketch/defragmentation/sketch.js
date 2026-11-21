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
import { SFC32 } from '@thi.ng/random'
import { convert, mul, quantity, NONE, cm, dpi } from '@thi.ng/units'
import { downloadWithMime } from '@thi.ng/dl-asset'
import {
    add2,
    distSq2,
    mulN2,
    normalize2,
    perpendicularCCW,
    sub2
} from '@thi.ng/vectors'
import { createNoise2D } from 'simplex-noise'
import { getRandSeed } from '../../sketch-common/random-seed'
import { getColorCombination } from '../../sketch-common/stabilo68-colors'
import { seedFromHash } from '../grid-on-grid/seed-from-hash'
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
    bgColor = '#e6d4d3',
    FALLBACK_PALETTE = {
        name: 'Default',
        colors: [
            { id: 0, name: 'Purple', value: '#5a4869' },
            { id: 1, name: 'Black', value: '#000' }
        ]
    },
    PARAMS = new URLSearchParams(window.location.search),
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

let RND, simplex, seed, folds, palette, N, parts, paths
let firstRun = true

APP.appendChild(CANVAS)
CANVAS.width = SIZE[0]
CANVAS.height = SIZE[1]

/**
 * Create a part. Everything random about it is decided here, so a part
 * looks the same on every render (folding only changes the parts it cuts).
 * @param {Array} pts polygon points
 * @param {Number} index used for dash parity
 * @param {Number} angle hatch direction (radians)
 */
const newPart = (pts, index, angle) =>
    polygon(pts, {
        index,
        angle,
        style: RND.int() % STYLES,
        pen: RND.int() % palette.colors.length,
        dashSeed: RND.int()
    })

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
    const isVertical = RND.float() > 0.5
    const a = isVertical
        ? [Math.round(RND.float(SIZE[0])), MARGIN / 2]
        : [MARGIN / 2, Math.round(RND.float(SIZE[1]))]
    const b = isVertical
        ? [Math.round(RND.float(SIZE[0])), SIZE[1] - MARGIN / 2]
        : [SIZE[0] - MARGIN / 2, Math.round(RND.float(SIZE[1]))]
    // one half is hatched along the cut, the other across it
    const theta = Math.atan2(b[1] - a[1], b[0] - a[0])

    parts = parts.flatMap((part) => {
        const halves = splitPart(part, a, b)
        return halves
            ? halves.map((h, k) =>
                  newPart(
                      h.points,
                      part.attribs.index + k + 1,
                      k ? theta : theta + Math.PI / 2
                  )
              )
            : [part]
    })
}

/**
 * Parallel lines at the part's angle, clipped to the part
 */
const hatchLines = (part) => {
    const { pos, size } = bounds(part)
    const c = [pos[0] + size[0] / 2, pos[1] + size[1] / 2]
    const r = Math.hypot(...size) / 2 + lineStep
    const { angle } = part.attribs
    const dir = [Math.cos(angle) * r, Math.sin(angle) * r]
    const nrm = [-Math.sin(angle), Math.cos(angle)]
    const lines = []
    for (let t = -r; t <= r; t += lineStep) {
        const p = add2([], c, mulN2([], nrm, t))
        lines.push(line(sub2([], p, dir), add2([], p, dir)))
    }
    return lines
        .map((l) => clipConvex(l, part)?.[0]?.points)
        .filter(Boolean)
}

// join hatch lines into one continuous path (boustrophedon) → fewer pen lifts
const serpentine = (segs) =>
    segs.flatMap((s, i) => (i % 2 ? [...s].reverse() : s))

// add points along the line so the noise actually bends it
const wavy = (pts) => noiseLine(resample(polyline(pts), { dist: 4 }).points)

const hatchPart = (part) => {
    const { index, style, dashSeed: s } = part.attribs
    const segs = hatchLines(part)
    if (!segs.length) return []
    // per-part generator: dashes don't change when another part is cut
    const rnd = new SFC32([s, s ^ 0xdecafbad, s ^ 0x2fa9d75b, s ^ 0xe41f67e3])

    switch (style) {
        // dash noise
        case 0:
            return segs.flatMap((seg) =>
                dashLine(seg, 128, index % 2, rnd).map((d) => wavy(d))
            )
        // full noise, one continuous path
        case 1:
            return [wavy(serpentine(segs))]
        // uniform dash straight
        case 2:
            return segs.flatMap((seg) => dashLine(seg, 256, 0, rnd))
        // random dash straight
        case 3:
            return segs.flatMap((seg) => dashLine(seg, 128, 1, rnd))
        // empty
        case 4:
            return []
        // straight lines, one continuous path
        case 5:
            return [serpentine(segs)]
        default:
            return segs
    }
}

/**
 * Greedy nearest-neighbour ordering (paths may be reversed) to cut pen travel
 */
const sortPaths = (list) => {
    const todo = [...list]
    const out = []
    let cur = [0, 0]
    while (todo.length) {
        let best = 0,
            bestD = Infinity,
            rev = false
        for (let i = 0; i < todo.length; i++) {
            const p = todo[i]
            const d0 = distSq2(cur, p[0])
            const d1 = distSq2(cur, p[p.length - 1])
            if (d0 < bestD) [bestD, best, rev] = [d0, i, false]
            if (d1 < bestD) [bestD, best, rev] = [d1, i, true]
        }
        const p = todo.splice(best, 1)[0]
        const q = rev ? [...p].reverse() : p
        out.push(q)
        cur = q[q.length - 1]
    }
    return out
}

// one Inkscape layer per pen
const layers = (pathsByPen) =>
    group(
        { fill: 'none', weight: lineWeight },
        palette.colors.map((col, i) =>
            group(
                { stroke: col.value, __inkscapeLayer: `${i + 1} ${col.name}` },
                pathsByPen[i].map((pts) => polyline(pts))
            )
        )
    )

// keep seed + folds in the address bar, so any state can be bookmarked
const updateUrl = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('seed', seed)
    url.searchParams.set('folds', folds)
    window.history.replaceState(null, '', url)
}

const render = () => {
    paths = palette.colors.map(() => [])
    parts.forEach((part) => {
        const pen = paths[part.attribs.pen]
        hatchPart(part)
            .filter((pts) => pts && pts.length > 1)
            .forEach((pts) => pen.push(pts))
    })
    draw(CTX, group({}, [rect(SIZE, { fill: bgColor }), layers(paths)]))
    updateUrl()
}

const sketch = {
    // new seed (or the one from the URL on first load) and redraw
    init: () => {
        let replayFolds = 0
        if (firstRun && PARAMS.has('seed')) {
            seed = PARAMS.get('seed')
            replayFolds = parseInt(PARAMS.get('folds')) || 0
        } else {
            seed = getRandSeed()
        }
        firstRun = false
        folds = 0
        RND = new SFC32(seedFromHash(seed))
        simplex = createNoise2D(() => RND.float())
        // palette only sets ink colors, not geometry (not seeded)
        palette = getColorCombination(2) || FALLBACK_PALETTE

        N = 1 + (RND.int() % 3)
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
                        (x + y) % 2,
                        (x + y) % 2 ? Math.PI / 2 : 0
                    )
                )
            }
        }
        for (let i = 0; i < I; i++) cutTile()
        for (; folds < replayFolds; folds++) cutTile()
        render()
        console.log(
            `seed: ${seed}\nfolds: ${folds}\npalette: ${palette.name}\n` +
                palette.colors.map((c) => ` - 68/${c.id} ${c.name}`).join('\n')
        )
    },
    // add one more cut
    fold: () => {
        cutTile()
        folds++
        render()
    },
    // export drawing as SVG file, one layer per pen, paths sorted for plotting
    export: () => {
        downloadWithMime(
            `Defragmentation-${seed}-${folds}.svg`,
            asSvg(
                svgDoc(
                    {
                        // physical size: Inkscape reads px at 96 dpi, SIZE is 72 dpi
                        width: '35cm',
                        height: '35cm',
                        viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                    },
                    layers(paths.map(sortPaths))
                )
            )
        )
    }
}

export default sketch
