import { resolve } from '@thi.ng/resolve-map'
import {
    pickRandom,
    pickRandomKey,
    pickRandomUnique,
    SFC32,
} from '@thi.ng/random'
import { repeatedly2d } from '@thi.ng/transducers'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { OPERATORS } from './operator'
import Fbm from './FBM'
import { LABELS } from './LABELS'
import { THEMES } from './THEMES'
import { seedFromHash } from './seed-from-hash'

const ATTRACT_ENGINE = strangeAttractor()

// Pick random value to build an edition ----------------------------------------
const DOMAIN = 70
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
            numLabel: RND.minmaxInt(2, 6),
            labelWidth: 260,
            labels: ({ numLabel, labelWidth, inner, margin }) => {
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
                    const out = [], maxTries = 1000
                    let t = 0
                    while (out.length < texts.length && t < maxTries) {
                        const randPos = [
                            RND.minmax(margin, inner[0] - labelWidth),
                            RND.minmax(margin, inner[1] - margin * 2)
                        ]
                        if (
                            out.reduce(
                                (away, txt) =>
                                    away &&
                                    (Math.abs(txt[0][0] - randPos[0]) >= labelWidth || Math.abs(txt[0][1] - randPos[1]) >= 200),
                                true
                            ) || out.length === 0
                        ) {
                            out.push([randPos, texts[out.length]])
                            t = 0
                        }
                        t++
                  }
                  return out
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

export { resolveState, DOMAIN }
