import { pickRandom } from '@thi.ng/random'
import { randMinMax } from '@thi.ng/vectors'
import TEXTS from './TEXTS'
import RULES from './RULES'
import THEMES from './THEMES'
import { randPartition } from './partition'
import animators from './animators'

const state = {
    // Evolving animation variables
    variations: {},
    // Constants sketch variable
    constants: {},
    // Functions to set/update variations values
    updateChoice: {
        animation: (incr = false) => {
            if (incr) {
                const animIdx = state.variations.animation + incr
                if (animIdx < 0) {
                    state.variations.animation = animators.length - 1
                } else if (animIdx > animators.length - 1) {
                    state.variations.animation = 0
                } else {
                    state.variations.animation = animIdx
                }
            } else {
                state.variations.animation = Math.floor(
                    Math.random() * animators.length
                )
            }
            console.log('animation: ', state.variations.animation)
            state.variations.fontSize = animators[state.variations.animation]
        },
        text: () => {
            state.variations.text = pickRandom(TEXTS)
            console.log('text: ', state.variations.text)
        },
        rule: () => {
            state.variations.rule = pickRandom(RULES)

            console.log('rule: ', state.variations.rule)
        },
        palette: () => {
            const [background, ...colors] = pickRandom(THEMES)
            state.variations.palette = {
                background,
                colors: colors.sort(() => (Math.random() > 0.5 ? -1 : 1))
            }
            console.log(
                colors.reduce(
                    (acc, col, i) =>
                        acc + `%c ${i === 0 ? 'color' : ''}██ ${col} \n`,
                    ''
                ),
                ...colors.map(
                    (col) => `background: ${background}; color: ${col}`
                )
            )
        },
        colorAxis: () => {
            state.variations.colorAxis = Math.random() > 0.5
            if (state.variations.colorSectionNum)
                state.variations.partition = randPartition(
                    state.variations.colorSectionNum,
                    state.variations.colorAxis
                        ? state.constants.MAX_COLS
                        : state.constants.MAX_ROWS
                )
            console.log(
                'colorAxis: ' + (state.variations.colorAxis ? 'x' : 'y')
            )
        },
        colorSectionNum: () => {
            state.variations.colorSectionNum = randMinMax(
                Math.ceil(state.variations.palette.colors.length / 2),
                state.variations.palette.colors.length - 1
            )
            state.variations.partition = randPartition(
                state.variations.colorSectionNum,
                state.variations.colorAxis
                    ? state.constants.MAX_COLS
                    : state.constants.MAX_ROWS
            )
            console.log('colorSectionNum: ', state.variations.colorSectionNum)
        }
    },
    initstate: () => {
        const PX_RATIO = window.devicePixelRatio,
            SIZE = [window.innerWidth, window.innerHeight].map((d) =>
                Math.floor(PX_RATIO * d)
            ),
            MARGIN = 60,
            MAX_COLS = Math.floor(SIZE[0] / 18),
            MAX_ROWS = Math.floor(SIZE[1] / 24),
            MAX_FPS = 25,
            FPS_INTERVAL = 1000 / MAX_FPS,
            NUM_FRAME = 180,
            BASE_SIZE = 54,
            WEIGHT = Math.max(...SIZE) > 1080 ? 2 : 1

        state.constants = {
            PX_RATIO,
            SIZE,
            MARGIN,
            MAX_COLS,
            MAX_ROWS,
            MAX_FPS,
            FPS_INTERVAL,
            NUM_FRAME,
            BASE_SIZE,
            WEIGHT,
            WAVE:
                '-/\\-/|v_____-/\\-///|\\__/\\---..___' +
                '-W\\//T\\/====  //\\___//  \\\\____  xx^yy' +
                '______________::::::::|||/\\___/..%..\\\\' +
                '== == === == == __ ____ _____ _____  []..'
        }
        const propToInit = Object.keys(state.updateChoice)
        propToInit.forEach((prop) => state.updateChoice[prop]())
    }
}

export default state
