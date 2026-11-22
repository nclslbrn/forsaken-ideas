import {
    rect,
    group,
    svgDoc,
    asSvg,
    resample,
    polyline,
    polygon
} from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { distSq2 } from '@thi.ng/vectors'
// import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { SFC32 } from '@thi.ng/random'
import { createNoise2D } from 'simplex-noise'
import { getRandSeed } from '../../sketch-common/random-seed'
import { seedFromHash } from '../grid-on-grid/seed-from-hash'
import { randomSplit } from './splitPoly'
import { randPoly } from './randPoly'
import { inset, roundCorners } from './polyShape'
import { hatchLines, serpentine, sortPaths } from './hatch'
import dashLine from './dashLine'
import modularGrid from './modular-grid'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(40, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    PARAMS = new URLSearchParams(window.location.search),
    PADDING = 3,
    RADIUS = 12,
    STYLES = 6,
    LINE_STEP = 4,
    LINE_WEIGHT = 1,
    DENSITY = [0.6, 2],
    OUTLINE = false

/* Live params (to compute) */
let RND, seed, simplex, width, height, drawElems
let firstRun = true

document.querySelector('#windowFrame').style.overflowY = 'auto'
ROOT.appendChild(CANVAS)

const updateUrl = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('seed', seed)
    window.history.replaceState(null, '', url)
}

// apply noise deformation to points
const noiseLine = (pts) => {
    const freq = 0.0007,
        turbulence = 15,
        force = 3 // keep it below PADDING so lines stay inside the shape
    return pts.map((pt) => {
        const n = turbulence * simplex(pt[0] * freq, pt[1] * freq)
        return [pt[0] + Math.cos(n) * force, pt[1] + Math.sin(n) * force]
    })
}

// add points along the line so the noise actually bends it
const wavy = (pts) => noiseLine(resample(polyline(pts), { dist: 4 }).points)

const randSpacing = () =>
    LINE_STEP * DENSITY[0] * (DENSITY[1] / DENSITY[0]) ** RND.float()

const hatchPart = ({ pts, index, angle, style, dashSeed: s, s0, s1 }) => {
    const segs = hatchLines(pts, angle, (t) => s0 + (s1 - s0) * t)
    if (!segs.length) return []
    const rnd = new SFC32([s, s ^ 0xdecafbad, s ^ 0x2fa9d75b, s ^ 0xe41f67e3])
    const join = () => serpentine(segs, Math.max(s0, s1) * 2.5)

    switch (style) {
        // dash noise
        case 0:
            return segs.flatMap((seg) =>
                dashLine(seg, 512, index % 2, rnd).map(wavy)
            )
        // full noise, continuous paths
        case 1:
            return join().map(wavy)
        // uniform dash straight
        case 2:
            return segs.flatMap((seg) => dashLine(seg, 360, 0, rnd))
        // random dash straight
        case 3:
            return segs.flatMap((seg) => dashLine(seg, 480, 1, rnd))
        // empty
        case 4:
            return []
        // straight lines, continuous paths
        default:
            return join()
    }
}

const init = () => {
    // URL seed only on first load, so the init button gives new drawings
    seed = firstRun && PARAMS.has('seed') ? PARAMS.get('seed') : getRandSeed()
    firstRun = false
    RND = new SFC32(seedFromHash(seed))
    simplex = createNoise2D(() => RND.float())
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const settings = {
        gridNumDivision: RND.minmaxInt(3, 6),
        basePolyNumPoints: RND.minmaxInt(12, 28),
        sliceNumDivision: RND.minmaxInt(2, 4)
    }

    const gridCells = modularGrid(
        settings.gridNumDivision,
        [[MARGIN, MARGIN, width, height]],
        RND,
        width / height
    ).map(([x, y, w, h]) => [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h]
    ])
    //.map((pts) => resample(polyline(pts), { dist: 12 }).points)

    // Poly subdivision -----------------------------------------------
    let pieces = gridCells // flat list of point arrays
    for (let i = 0; i < settings.sliceNumDivision; i++) {
        const next = []
        for (const pts of pieces) {
            const { parts } = randomSplit(pts, () => RND.float())
            next.push(...parts.filter((p) => p && p.length >= 3))
        }
        pieces = next
    }
    const padded = pieces.map((pts) => inset(pts, PADDING))
    /*
    const parts = pieces
        .map((pts) => inset(pts, PADDING))
        .filter(Boolean)
        .map((pts, index) => {
            const s0 = randSpacing()
            // 1 part in 3 stays uniform, the others get a gradient
            const s1 = RND.float() < 1 / 3 ? s0 : randSpacing()
            return {
                pts: roundCorners(pts, RADIUS),
                index,
                angle: RND.float(Math.PI),
                style: RND.int() % STYLES,
                dashSeed: RND.int(),
                s0,
                s1
            }
        })

    // Connectors -----------------------------------------------------
    // vertices of the pieces that lie on the base outline (pre-inset)
    const onOutline = (p) =>
        points.some((a, i) => {
            const b = points[(i + 1) % points.length]
            const abx = b[0] - a[0],
                aby = b[1] - a[1]
            const t = Math.max(
                0,
                Math.min(
                    1,
                    ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) /
                        (abx * abx + aby * aby)
                )
            )
            return (
                Math.hypot(p[0] - a[0] - t * abx, p[1] - a[1] - t * aby) < 1e-3
            )
        })

    const outer = []
    for (const pts of pieces)
        for (const p of pts)
            if (onOutline(p) && !outer.some((o) => distSq2(o, p) < 1))
                outer.push(p)

    // all points of the final shapes, to snap each connector onto a real curve
    const drawn = parts.flatMap((part) => part.pts)

    const cross = (o, a, b) =>
        (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    const segsCross = (a, b, c, d) =>
        cross(a, b, c) * cross(a, b, d) < 0 &&
        cross(c, d, a) * cross(c, d, b) < 0

    const DIRS = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ]

    // axis-aligned end point on the margin rectangle
    const edgeEnd = ([x, y], [dx, dy]) => [
        dx > 0 ? SIZE[0] - MARGIN : dx < 0 ? MARGIN : x,
        dy > 0 ? SIZE[1] - MARGIN : dy < 0 ? MARGIN : y
    ]

    // every edge of every final shape (closed rings)
    const edges = parts.flatMap((part) =>
        part.pts.map((a, i) => [a, part.pts[(i + 1) % part.pts.length]])
    )

    // does the axis-aligned ray from `s` in direction `dir` cross any shape edge?
    const EPS = 1e-6
    const rayBlocked = (s, [dx, dy]) => {
        const k = dx !== 0 ? 1 : 0 // coordinate that stays constant
        const m = 1 - k // coordinate that moves
        const sign = dx !== 0 ? dx : dy
        for (const [a, b] of edges) {
            if (a[k] >= s[k] === b[k] >= s[k]) continue
            const t = (s[k] - a[k]) / (b[k] - a[k])
            const pos = a[m] + t * (b[m] - a[m])
            if (sign > 0 ? pos > s[m] + EPS : pos < s[m] - EPS) return true
        }
        return false
    }

    const connectors = []
    for (const p of outer) {
        // nearest point actually drawn (the inset + rounding moved the corner)
        let start = drawn[0],
            best = Infinity
        for (const q of drawn) {
            const d = distSq2(p, q)
            if (d < best) [best, start] = [d, q]
        }

        // all free directions, shortest first
        const candidates = DIRS.map((dir) => ({
            dir,
            end: edgeEnd(start, dir)
        }))
            .map((c) => ({
                ...c,
                len: Math.hypot(c.end[0] - start[0], c.end[1] - start[1])
            }))
            .filter((c) => c.len >= 1 && !rayBlocked(start, c.dir))
            .sort((u, v) => u.len - v.len)

        for (const { end } of candidates) {
            // never cross a connector that was already accepted
            if (connectors.some(([c, d]) => segsCross(start, end, c, d)))
                continue
            connectors.push([start, end])
            break
        }
    }
    // hatches ---------------------------------------------------------
    const paths = []
    paths.push(...connectors)

    parts.forEach((part) => {
        const hatches = hatchPart(part).filter((pts) => pts.length > 1)
        if (hatches.length) paths.push(...hatches)
        else paths.push([...part.pts, part.pts[0]])
    })
     */

    // console.log(`seed: ${seed}\nshapes: ${parts.length}`)
    drawElems = [
        rect(SIZE, { fill: '#fbeef7' }),
        group(
            { stroke: 'none', fill: '#666' },
            padded.map((pts) => polygon(roundCorners(pts, RADIUS)))
        )
    ]

    draw(CTX, group({}, drawElems))
    updateUrl()
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Walker is back-${seed}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Walker is back-${seed}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                // no background rect in the plot file
                group({}, drawElems.slice(1))
            )
        )
    )
}

window.infobox = infobox
handleAction()
