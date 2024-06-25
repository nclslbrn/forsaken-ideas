import sentences from './SENTENCES'
import { SYSTEM, pickRandom } from '@thi.ng/random'
// Default grid setup (at sketch launch)
let state = {
    types: [],
    t: 2,
    alter: '',
    stop: 1,
    idx: false,
    fixedType: false,
    seq: false,
    colsRows: [],
    modMotionLength: 0,
    palette: {}
}

// A list of function for altering the type grid
// Each property of this object is a possible alteration, an array with the first value
// is a function wich runs several times and the second returns args define two variables
// of the alteration (seq an array of char, and idx a number of column or rows or sumply
// the current number of loop within this alteration occurs)
const alter = {
    slideDown: [
        (seq = false, idx = false) => {
            for (let x = 0; x < state.colsRows[0]; x++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && x !== idx)) {
                    for (let y = 0; y < state.colsRows[1]; y++) {
                        const top = y * state.colsRows[0] + x,
                            nextRow = y < state.colsRows - 1 ? y + 1 : 0,
                            bottom = nextRow * state.colsRows[0] + x,
                            tType = state.types[top],
                            bType = state.types[bottom]

                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => [state.colsRows[1], state.colsRows[0]/4]
    ],
    slideUp: [
        (seq = false, idx = false) => {
            for (let x = 0; x < state.colsRows[0]; x++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && x !== idx)) {
                    for (let y = state.colsRows[1] - 1; y >= 0; y--) {
                        const top = y * state.colsRows[0] + x,
                            nextRow = y === state.colsRows - 1 ? y + 1 : 0,
                            bottom = nextRow * state.colsRows[0] + x,
                            tType = state.types[top],
                            bType = state.types[bottom]

                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => [state.colsRows[1], state.colsRows[0]/4]
    ],
    slideLeft: [
        (seq = false, idx = false) => {
            for (let y = 0; y < state.colsRows[1]; y++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && y !== idx)) {
                    const right = state.colsRows[0] * y + state.colsRows[0] - 1,
                        left = state.colsRows[0] * y,
                        lType = state.types[left]
                    state.types.splice(left, 1)
                    state.types.splice(
                        right,
                        0,
                        lType
                    )
                }
            }
        },
        () => [state.colsRows[0], state.colsRows[1]/4]
    ],
    slideRight: [
        (seq = false, idx = false) => {
            for (let y = 0; y < state.colsRows[1]; y++) {
                if ((!idx && SYSTEM.float() > 0.5) || (idx && y !== idx)) {
                    const right = state.colsRows[0] * y + state.colsRows[0] - 1,
                        left = state.colsRows[0] * y,
                        rType = state.types[right]

                    state.types.splice(right, 1)
                    state.types.splice(
                        left,
                        0,
                        rType
                    )
                }
            }
        },
        () => [state.colsRows[0], state.colsRows[1]/4]
    ],

    fillLeftMidRow: [
        (seq = false, idx = false) => {
            const y = idx || Math.round(state.colsRows[1] / 2)
            const c = y * state.colsRows[0] + state.t
            state.types[c] = seq ? seq[(idx ?idx : c) % seq.length] : state.types[c - 1]
        },
        () => [state.colsRows[0], state.colsRows[1]]
    ],
    fillRightMidRow: [
        (seq = false, idx = false) => {
            const y = idx || Math.round(state.colsRows[1] / 2)
            const c = y * state.colsRows[0] + (state.colsRows[0] - state.t - 1)
            state.types[c] = seq ? seq[(idx ?idx : c)  % seq.length] : state.types[c - 1]
        },
        () => [state.colsRows[0], state.colsRows[1]]
    ],
    fillTopMidColum: [
        (seq = false, idx = false) => {
            const x = idx || Math.round(state.colsRows[0] / 2)
            const c = state.t * state.colsRows[0] + x
            const p =
                state.t > 0
                    ? (state.t - 1) * state.colsRows[0] + x
                    : state.colsRows[0] * (state.colsRows[1] - 1) + x
            state.types[c] = seq ? seq[(idx ?idx : c)  % seq.length] : state.types[p]
        },
        () => [state.colsRows[1], state.colsRows[0]]
    ],
    fillBottomMidColum: [
        (seq = false, idx = false) => {
            const x = idx || Math.round(state.colsRows[0] / 2)
            const c = (state.colsRows[1] - state.t - 1) * state.colsRows[0] + x
            const p =
                state.t === state.colsRows[1] - 1
                    ? state.colsRows[0] + x
                    : state.colsRows[0] * (state.t + 1) + x
            state.types[c] = seq ? seq[(idx ?idx : c) % seq.length] : state.types[p]
        },
        () => [state.colsRows[1], state.colsRows[0]]
    ]
    /* 
    alert: [
        (seq = false, idx = false) => {
            const phrase = [
                    ...sentences[(seq ? seq.length : idx) % sentences.length]
                ],
                col = pickRandom(state.palette.colors),
                y = state.colsRows[0] * (idx || 0),
                x = Math.round((state.colsRows[0] - phrase.length) / 2)

            for (let i = 0; i < phrase.length; i++) {
                state.types[(y + x + i) % state.types.length] = [phrase[i], col]
            }
        },
        () => [3, sentences.length]
    ]
    */
}

export { state, alter }
