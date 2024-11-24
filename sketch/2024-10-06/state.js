import { resolve } from '@thi.ng/resolve-map'
import { pickRandom, pickRandomKey, pickRandomUnique, Smush32 } from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { OPERATORS } from './operator'
import Fbm from './FBM'
import { LABELS } from './LABELS'
import { THEMES } from './THEMES'

const ATTRACT_ENGINE = strangeAttractor()

// Pick random value to build an edition ----------------------------------------
const BASE = (config) => {
    const RND = new Smush32(config.seed)

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
            numLabel: RND.minmaxInt(2, 4),
            labelWidth: 420,
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
                            RND.minmax(margin * 1.5, height - margin * 4)
                        ],
                        str
                    ])
                }
            },
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

export { resolveState }
