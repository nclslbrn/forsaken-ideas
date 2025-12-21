import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, pickRandomKey, SFC32 } from '@thi.ng/random'
import { repeatedly2d, repeatedly } from '@thi.ng/transducers'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { OPERATORS } from './operator'
import Fbm from './FBM'
import { THEMES } from './THEMES'
import { seedFromHash } from './seed-from-hash'

const ATTRACT_ENGINE = strangeAttractor()

// Pick RND. value to build an edition ----------------------------------------
const DOMAIN = 70
const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))
    const shuffle = (array) => array.sort(() => 0.5 - RND.float())
    const splitCell = (isHorizontal, grid) => {
        const toSplit = grid.sort((a, b) => a[2] * a[3] < b[2] * b[3])[0]
        const [x, y, w, h] = toSplit
        const c =
            RND.float() > 0.5
                ? 1 / Math.ceil(1 + RND.float() * 2)
                : 1 - 1 / Math.ceil(1 + RND.float() * 2)
        let splitted = []
        if (isHorizontal) {
            const ws = shuffle([w * c, w * (1 - c)])
            splitted = [
                [x - w * 0.5 + ws[0] * 0.5, y, ws[0], h],
                [x + w * 0.5 - ws[1] * 0.5, y, ws[1], h]
            ]
        } else {
            const hs = shuffle([h * c, h * (1 - c)])
            splitted = [
                [x, y - h * 0.5 + hs[0] * 0.5, w, hs[0]],
                [x, y + h * 0.5 - hs[1] * 0.5, w, hs[1]]
            ]
        }
        grid.splice(grid.indexOf(toSplit), 1)
        grid.push(...splitted)
        return grid
    }
    return resolve(
        {
            ...config,
            DOMAIN,
            inner: ({ width, height, margin }) => [
                width - margin * 2,
                height - margin * 2
            ],
            shape: () => ({
                type: 1, //RND.minmaxInt(0, 2), // 0: sphere, 1: cube
                pos: [RND.float() - 0.5, RND.float() - 0.5, RND.float() - 1],
                size: RND.minmax(0.33, 0.66),
                rot: [
                    RND.minmaxInt(0, 360),
                    RND.minmaxInt(0, 360),
                    RND.minmaxInt(0, 360)
                ], // rotation in radians
                lightPos: [
                    (RND.float() - 0.5) * 5,
                    (RND.float() - 0.5) * 5,
                    RND.float() + 1
                ]
            }),
            attractor: () => {
                const picked = pickRandom(
                    Object.keys(ATTRACT_ENGINE.attractors),
                    RND
                )
                ATTRACT_ENGINE.init(picked, () => RND.float())
                return picked
            },
            operator: pickRandom(OPERATORS, RND),
            noise: new Fbm({
                amplitude: 0.4,
                octave: 7,
                frequencies: 0.7,
                prng: () => RND.float
            }),
            prtcls: [
                ...repeatedly2d(
                    (x, y) => [
                        (RND.norm(5) + x) / DOMAIN - 0.5,
                        (RND.norm(5) + y) / DOMAIN - 0.5
                    ],
                    DOMAIN,
                    DOMAIN
                )
            ],

            trails: ({ prtcls }) => prtcls.map((p) => [p]),
            theme: pickRandomKey(THEMES, RND),
            colors: ({ theme }) => THEMES[theme]
        },
        { onlyFnRefs: true }
    )
}

// Setup state for a new edition ------------------------------------------------
const resolveState = (config) =>
    resolve(
        {
            ...BASE(config),
            ...config,
            domainToPixels:
                ({ width, height }) =>
                ([x, y]) => [width / 2 + x * width, height / 2 + y * height]
        },
        { onlyFnRefs: true }
    )

export { resolveState, DOMAIN }
