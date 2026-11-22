import { rect, group, svgDoc, asSvg, resample, polyline } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
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
import { inset, roundCorners } from './polyShape'
import { hatchLines, serpentine, sortPaths } from './hatch'
import dashLine from './dashLine'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    PARAMS = new URLSearchParams(window.location.search),
    PADDING = 4,
    RADIUS = 24,
    STYLES = 6,
    LINE_STEP = 12,
    LINE_WEIGHT = 3,
    OUTLINE = false

/* Live params (to compute) */
let RND, seed, simplex, width, height, drawElems
let firstRun = true

ROOT.appendChild(CANVAS)

const updateUrl = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('seed', seed)
    window.history.replaceState(null, '', url)
}

// distance from c to the inner rectangle edge, along angle a
const rayToRect = ([cx, cy], a) => {
    const dx = Math.cos(a),
        dy = Math.sin(a)
    const tx =
        dx > 0
            ? (SIZE[0] - MARGIN - cx) / dx
            : dx < 0
              ? (MARGIN - cx) / dx
              : Infinity
    const ty =
        dy > 0
            ? (SIZE[1] - MARGIN - cy) / dy
            : dy < 0
              ? (MARGIN - cy) / dy
              : Infinity
    return Math.min(tx, ty)
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

const hatchPart = ({ pts, index, angle, style, dashSeed: s }) => {
    const segs = hatchLines(pts, angle, LINE_STEP)
    if (!segs.length) return []
    // per-part generator: dashes are reproducible for a given seed
    const rnd = new SFC32([s, s ^ 0xdecafbad, s ^ 0x2fa9d75b, s ^ 0xe41f67e3])
    const join = () => serpentine(segs, LINE_STEP * 2.5)

    switch (style) {
        // dash noise
        case 0:
            return segs.flatMap((seg) =>
                dashLine(seg, 256, index % 2, rnd).map(wavy)
            )
        // full noise, continuous paths
        case 1:
            return join().map(wavy)
        // uniform dash straight
        case 2:
            return segs.flatMap((seg) => dashLine(seg, 128, 0, rnd))
        // random dash straight
        case 3:
            return segs.flatMap((seg) => dashLine(seg, 128, 1, rnd))
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
        basePolyNumPoints: RND.minmaxInt(12, 24),
        numDivision: RND.minmaxInt(4, 8)
    }
    // center in the middle area, so the polygon stays large on every side
    const center = [
        MARGIN + width * RND.minmax(0.3, 0.7),
        MARGIN + height * RND.minmax(0.3, 0.7)
    ]
    const offset = RND.float(Math.PI * 2)
    const points = [...Array(settings.basePolyNumPoints)].map((_, k) => {
        // evenly spaced angles + jitter (< half a gap, so the order is kept
        // and the polygon never self-intersects)
        const a =
            offset +
            ((k + RND.minmax(-0.3, 0.3)) / settings.basePolyNumPoints) *
                Math.PI *
                2
        // 1 = on the inner rectangle edge
        const r = rayToRect(center, a) * RND.minmax(0.6, 1)
        return [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r]
    })

    let pieces = [points] // flat list of point arrays
    for (let i = 0; i < settings.numDivision; i++) {
        const next = []
        for (const pts of pieces) {
            const { parts } = randomSplit(pts, () => RND.float())
            next.push(...parts.filter((p) => p && p.length >= 3))
        }
        pieces = next
    }
    const parts = pieces
        .map((pts) => inset(pts, PADDING))
        .filter(Boolean)
        .map((pts, index) => ({
            pts: roundCorners(pts, RADIUS),
            index,
            angle: RND.float(Math.PI),
            style: RND.int() % STYLES,
            dashSeed: RND.int()
        }))

    const paths = []
    parts.forEach((part) => {
        hatchPart(part)
            .filter((pts) => pts.length > 1)
            .forEach((pts) => paths.push(pts))
        if (OUTLINE) paths.push([...part.pts, part.pts[0]])
    })
    console.log(`seed: ${seed}\nshapes: ${parts.length}`)
    drawElems = [
        rect(SIZE, { fill: '#EEE' }),
        group(
            { stroke: '#333', weight: LINE_WEIGHT, fill: 'none' },
            paths.map((pts) => polyline(pts))
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
