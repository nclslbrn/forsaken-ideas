import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, Smush32 } from '@thi.ng/random'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { OPERATORS } from './operator'
import { repeatedly2d } from '@thi.ng/transducers'
import Fbm from './FBM'

const ATTRACT_ENGINE = strangeAttractor(),
    RND = new Smush32(),
    BCKGRND = 'eeede7-e2ded0-b7ccca-f1ebe9-e2ceca-d6e2ed'.split('-').map(c => `#${c}`) 

// Pick random value to build an edition ----------------------------------------
const BASE = (seed) => {
    console.log(seed, seed.length)
    RND.seed(seed)
    return resolve(
        {
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
                        (RND.norm(5) + x) / 75 - 0.5,
                        (RND.norm(5) + y) / 75 - 0.5
                    ],
                    75,
                    75
                )
            ],
            trails: ({ prtcls }) => prtcls.map((p) => [p]),
            color: pickRandom(BCKGRND, RND)
        },
        { onlyFnRefs: true }
    )
}

// Setup state for a new edition ------------------------------------------------
const resolveState = (config) =>
    resolve(
        {
            ...BASE(config.seed),
            ...config,
        },
        { onlyFnRefs: true }
    )

export { resolveState }
