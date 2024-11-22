import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, pickRandomUnique, Smush32 } from '@thi.ng/random'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { OPERATORS } from './operator'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import Fbm from './FBM'
import { LABELS } from './LABELS'

const ATTRACT_ENGINE = strangeAttractor(),
    RND = new Smush32(),
    BCKGRND = 'eeede7-e2ded0-b7ccca-f1ebe9-e2ceca-d6e2ed'
        .split('-')
        .map((c) => `#${c}`)

// Pick random value to build an edition ----------------------------------------
const BASE = (config) => {
    console.log(config.seed, config.seed.length)
    RND.seed(config.seed)
    return resolve(
        {
            ...config,
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
            numLabel: RND.minmaxInt(1, 4),
            labelWidth: ({ width }) => width * 0.25,
            labels: ({ numLabel, labelWidth, width, height, margin }) => {
                if (numLabel === 0) {
                    return []
                } else {
                    const texts = pickRandomUnique(
                        numLabel,
                        LABELS,
                        [],
                        100,
                        RND
                    )
                    return texts.map((str) => [
                        [
                            RND.minmax(margin, width - labelWidth - margin),
                            RND.minmax(margin * 1.5, height - margin * 2)
                        ],
                        str
                    ])
                }
            },
            color: pickRandom(BCKGRND, RND)
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

export { resolveState }
