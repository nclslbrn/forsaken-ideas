import SENTENCES from './SENTENCES'
import { SYSTEM } from '@thi.ng/random'
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
    palette: {},
    rand: SYSTEM
}


// A list of function for altering the type grid
// Each property of this object is a possible alteration, an array with the first value
// is a function wich runs several times and the second returns args define two variables
// of the alteration (seq an array of char, and idx a number of column or rows or sumply
// the current number of loop within this alteration occurs)
const alter = {
    slideDown: [
        (seq = false) => {
            const {idx, colsRows, t, rand } = state
            for (let x = 0; x < colsRows[0]; x++) {
                if (
                    (!idx && rand.float() < 1 / colsRows[0]) ||
                    (idx && x !== idx)
                ) {
                    for (let y = 0; y < colsRows[1]; y++) {
                        const top = y * colsRows[0] + x,
                            nextRow = y < colsRows - 1 ? y + 1 : 0,
                            bottom = nextRow * colsRows[0] + x,
                            tType = state.types[top],
                            bType = state.types[bottom]

                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => {
          state.stop = state.rand.minmaxInt(1, state.colsRows[1]/4)
          state.idx = state.rand.minmaxInt(1, state.colsRows[0]-1)
        }
    ],
    slideUp: [
        (seq = false) => {
            const {idx, colsRows, t, rand } = state
            for (let x = 0; x < colsRows[0]; x++) {
                if (
                    (!idx && rand.float() < 1 / colsRows[0]) ||
                    (idx && x !== idx)
                ) {
                    for (let y = colsRows[1] - 1; y >= 0; y--) {
                        const top = y * colsRows[0] + x,
                            nextRow = y === colsRows - 1 ? y + 1 : 0,
                            bottom = nextRow * colsRows[0] + x,
                            tType = state.types[top],
                            bType = state.types[bottom]

                        state.types[bottom] = tType
                        state.types[top] = bType
                    }
                }
            }
        },
        () => {
          state.stop =  state.rand.minmaxInt(1, state.colsRows[1]/4)
          state.idx = SYSTEM.minmaxInt(1, state.colsRows[0]-1)
        }
    ],
    slideLeft: [
        (seq = false) => {
            const {idx, colsRows, t, rand } = state
            for (let y = 0; y < colsRows[1]; y++) {
                if ((!idx && rand.float() > 0.5) || (idx && y !== idx)) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        lType = state.types[left]
                    state.types.splice(left, 1)
                    state.types.splice(right, 0, lType)
                }
            }
        },
        () => {
          state.stop = state.rand.minmaxInt(1, state.colsRows[0]/4)
          state.idx = SYSTEM.minmaxInt(1, state.colsRows[1]-1)
        }
    ],
    slideRight: [
        (seq = false) => {
            const {idx, colsRows, t, rand } = state
            for (let y = 0; y < colsRows[1]; y++) {
                if ((!idx && rand.float() > 0.5) || (idx && y !== idx)) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        rType = state.types[right]

                    state.types.splice(right, 1)
                    state.types.splice(left, 0, rType)
                }
            }
        },
        () => {
          state.stop = state.rand.minmaxInt(1, state.colsRows[0]/4)
          state.idx = state.rand.minmaxInt(1, state.colsRows[1]-1)
        }
    ],
    fillLeftRow: [
        (seq = false) => {
            const {idx, colsRows, t} = state
            const y = idx >= 0 ? idx : Math.floor(colsRows[1] / 2)
            const c = y * colsRows[0] + t
            state.types[c] = seq
                ? seq[(idx >= 0 ? idx : c) % seq.length]
                : state.types[c + 1]
        },
        () => {
          state.stop = state.rand.minmaxInt(0, state.colsRows[0])
          state.idx = state.rand.minmaxInt(0, state.colsRows[1]-1)
        }
    ],
    fillRightRow: [
        (seq = false) => {
            const {idx, colsRows, t} = state
            const y = idx >= 0 ? idx : Math.ceil(colsRows[1] / 2)
            const c = y * colsRows[0] + (colsRows[0] - t - 1)
            state.types[c] = seq
                ? seq[(idx >= 0 ? idx : c) % seq.length]
                : state.types[c - 1]
        },
        () => {
          state.stop = state.rand.minmaxInt(0, state.colsRows[0])
          state.idx = state.rand.minmaxInt(0, state.colsRows[1])
        }
    ],
    
    fillTopColum: [
        (seq = false) => {
            const {idx, colsRows, t} = state
            const x = idx >= 0 ? idx : Math.floor(colsRows[0] / 2)
            const c = t * colsRows[0] + x
            const p = t
                ? t * colsRows[0] + x
                : colsRows[0] * (colsRows[1] - 1) + x
            state.types[c] = seq
                ? seq[(idx >= 0 ? idx : c) % seq.length]
                : state.types[p]
        },
        () => {
          state.stop = state.rand.minmaxInt(0, state.colsRows[1])
          state.idx = state.rand.minmaxInt(0, state.colsRows[0])
        }
    ],
    fillBottomColum: [
        (seq = false) => {
            const {idx, colsRows, t} = state
            const x = idx >= 0 ? idx : Math.ceil(colsRows[0] / 2)
            const c = (colsRows[1] - t - 1) * state.colsRows[0] + x
            const p =
                t === colsRows[1] - 1
                    ? colsRows[0] + x
                    : colsRows[0] * t+1 + x
            state.types[c] = seq
                ? seq[idx % seq.length]
                : state.types[p]
        },
        () => {
          //console.log(state.colsRows[0])
          state.stop = state.rand.minmaxInt(0, state.colsRows[1]), 
          state.idx = SYSTEM.minmaxInt(0, state.colsRows[0])
        }
    ]
    /* alert: [
        (seq = false, idx = false) => {
            const phrase = [
                    ...SENTENCES[(seq ? seq.length : idx) % SENTENCES.length]
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
