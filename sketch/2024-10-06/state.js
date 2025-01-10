import { resolve } from '@thi.ng/resolve-map'
import {
    pickRandom,
    pickRandomKey,
    SFC32,
} from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { OPERATORS } from './operator'
import Fbm from './FBM'
import { THEMES } from './THEMES'
import { seedFromHash } from './seed-from-hash'

const ATTRACT_ENGINE = strangeAttractor()

// Pick random value to build an edition ----------------------------------------
const DOMAIN = 100
const BASE = (config) => {
    const RND = new SFC32(seedFromHash(config.seed))

    return resolve(
        {
            ...config,
            inner: ({ width, height, margin }) => [
                width - margin * 2,
                height - margin * 2
            ],
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
            ...config
        },
        { onlyFnRefs: true }
    )

export { resolveState, DOMAIN }
