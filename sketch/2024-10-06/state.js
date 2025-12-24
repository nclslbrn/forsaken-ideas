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

const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))

    return resolve(
        {
            ...config,
            domain: 70,

            inner: ({ width, height, margin }) => [
                width - margin * 2,
                height - margin * 2
            ],
            shape: () => ({
                type: RND.minmaxInt(0, 4),
                pos: [RND.float() - 0.5, RND.float() - 0.5, RND.float() - 1],
                size: RND.minmax(0.2, 0.5),
                rot: [
                    RND.minmaxInt(0, 360),
                    RND.minmaxInt(0, 360),
                    RND.minmaxInt(0, 360)
                ], // rotation in radians
                fractalIterations: RND.minmaxInt(2, 4),
                lightPos: [
                    (RND.float() - 0.5) * 5,
                    (RND.float() - 0.5) * 5,
                    RND.float() + 0.5
                ]
            }),
            shapeName: ({ shape }) =>
                [
                    'sphere',
                    'cube',
                    'menger sponge',
                    'sierpinski pyramid',
                    'mandelbox'
                ][shape.type],
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
            prtcls: ({ domain }) => [
                ...repeatedly2d(
                    (x, y) => [
                        (RND.norm(5) + x) / domain - 0.5,
                        (RND.norm(5) + y) / domain - 0.5
                    ],
                    domain,
                    domain
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
                ({ margin, inner }) =>
                ([x, y]) => [
                    margin + inner[0] / 2 + x * inner[0],
                    margin + inner[1] / 2 + y * inner[1]
                ]
        },
        { onlyFnRefs: true }
    )

export { resolveState }
