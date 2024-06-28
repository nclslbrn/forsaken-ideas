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
            const { idx, colsRows, t, rand } = state
            for (let x = 0; x < colsRows[0]; x++) {
                if (
                    (!idx && rand.float() < 1 / colsRows[0]) ||
                    (idx && Math.abs(x - idx) <= 1)
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
            state.stop = state.rand.minmaxInt(2, state.colsRows[1] / 2)
            state.idx = state.rand.minmaxInt(1, state.colsRows[0] + 1)
        }
    ],

    slideUp: [
        (seq = false) => {
            const { idx, colsRows, t, rand } = state
            for (let x = 0; x < colsRows[0]; x++) {
                if (
                    (!idx && rand.float() < 1 / colsRows[0]) ||
                    (idx && Math.abs(x - idx) <= 1)
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
            state.stop = state.rand.minmaxInt(2, state.colsRows[1] / 2)
            state.idx = SYSTEM.minmaxInt(1, state.colsRows[0] + 1)
        }
    ],

    slideLeft: [
        (seq = false) => {
            const { idx, colsRows, t, rand } = state
            for (let y = 0; y < colsRows[1]; y++) {
                if (
                    (!idx && rand.float() > 0.5) ||
                    (idx && Math.abs(y - idx) <= 1)
                ) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        lType = state.types[left]
                    state.types.splice(left, 1)
                    state.types.splice(right, 0, lType)
                }
            }
        },
        () => {
            state.stop = state.rand.minmaxInt(2, state.colsRows[0] / 2)
            state.idx = SYSTEM.minmaxInt(1, state.colsRows[1] + 1)
        }
    ],

    slideRight: [
        (seq = false) => {
            const { idx, colsRows, t, rand } = state
            for (let y = 0; y < colsRows[1]; y++) {
                if (
                    (!idx && rand.float() > 0.5) ||
                    (idx && Math.abs(y - idx) <= 1)
                ) {
                    const right = colsRows[0] * y + colsRows[0] - 1,
                        left = colsRows[0] * y,
                        rType = state.types[right]

                    state.types.splice(right, 1)
                    state.types.splice(left, 0, rType)
                }
            }
        },
        () => {
            state.stop = state.rand.minmaxInt(2, state.colsRows[0] / 2)
            state.idx = state.rand.minmaxInt(1, state.colsRows[1])
        }
    ],

    fillLeftRow: [
        (seq = false) => {
            const { idx, colsRows, t } = state
            const y = idx >= 0 ? idx : Math.floor(colsRows[1] / 2)
            const c = y * colsRows[0] + t
            state.types[c] = seq ? seq[t % seq.length] : state.types[c + 1]
        },
        () => {
            state.stop = state.rand.minmaxInt(2, state.colsRows[0] / 2)
            state.idx = state.rand.minmaxInt(0, state.colsRows[1])
        }
    ],

    fillRightRow: [
        (seq = false) => {
            const { idx, colsRows, t } = state
            const y = idx >= 0 ? idx : Math.ceil(colsRows[1] / 2)
            const c = y * colsRows[0] + (colsRows[0] - t - 1)
            state.types[c] = seq ? seq[t % seq.length] : state.types[c - 1]
        },
        () => {
            state.stop = state.rand.minmaxInt(2, state.colsRows[0] / 2)
            state.idx = state.rand.minmaxInt(0, state.colsRows[1])
        }
    ],

    fillTopColum: [
        (seq = false) => {
            const { idx, colsRows, t } = state
            const x = idx >= 0 ? idx : Math.floor(colsRows[0] / 2)
            const c = t * colsRows[0] + x
            const p = t
                ? t * colsRows[0] + x
                : colsRows[0] * (colsRows[1] - 1) + x
            state.types[c] = seq ? seq[t % seq.length] : state.types[p]
        },
        () => {
            state.stop = state.rand.minmaxInt(2, state.colsRows[1] / 2)
            state.idx = state.rand.minmaxInt(0, state.colsRows[0])
        }
    ],

    fillBottomColum: [
        (seq = false) => {
            const { idx, colsRows, t } = state
            const x = idx >= 0 ? idx : Math.ceil(colsRows[0] / 2)
            const c = (colsRows[1] - t - 1) * state.colsRows[0] + x
            const p =
                t === colsRows[1] - 1
                    ? colsRows[0] + x
                    : colsRows[0] * t + 1 + x
            state.types[c] = seq ? seq[t % seq.length] : state.types[p]
        },
        () => {
            state.stop = state.rand.minmaxInt(2, state.colsRows[1] / 2)
            state.idx = SYSTEM.minmaxInt(0, state.colsRows[0])
        }
    ],
    
    mirrorizeXY: [
        (seq = false) => {
            const { colsRows, t, idx } = state,
                midCols = Math.ceil(colsRows[0] / 2)

            for (let x = 0; x < midCols; x++) {
                const src =
                    x % idx === 0 && seq
                        ? seq[t % seq.length]
                        : state.types[t * colsRows[0] + x]

              state.types[t * colsRows[0] + x] = src
              state.types[t * colsRows[0] + colsRows[0] - (x + 1)] = src
              state.types[
                  (colsRows[1] - (t + 1)) * colsRows[0] + colsRows[0] - (x + 1)
              ] = src
              state.types[(colsRows[1] - (t + 1)) * colsRows[0] + x] = src
            }
        },
        () => {
            state.stop = Math.ceil(state.colsRows[1] / 2)
            state.idx = SYSTEM.minmaxInt(2, state.colsRows[0] / 4)
        }
    ],
    mirrorY: [
        (seq = false) => {
            const { colsRows, t, idx } = state
            const start = t * colsRows[0]
            for (let x = 0; x < state.colsRows[0]; x++) {
                const src =
                    x % idx === 0 && seq
                        ? seq[t % seq.length]
                        : state.types[start + x]
                state.types[start + x] = src
                state.types[Math.ceil(colsRows[1] / 2) * colsRows[1] + x] = src
            }
        },
        () => {
            state.stop = Math.floor(state.colsRows[1] / 2)
            state.idx = SYSTEM.minmaxInt(2, state.colsRows[0] / 2)
        }
    ],
    mirrorX : [
      (seq = false) => {
          const { colsRows, t, idx } = state
          for (let y = 0; y < state.colsRows[1]; y++) {
              const src = y % idx === 0 && seq
                  ? seq[t % seq.length]
                  : state.types[y + t]
              state.types[y + t] = src 
              state.types[y + (colsRows[0] - (t+1))] = src
          }
      },
      () => {
          state.stop = Math.floor(state.colsRows[0]/ 2)
          state.idx = SYSTEM.minmaxInt(2, state.colsRows[1] / 4)
      }
    ],
     
    insert: [
        (seq = false) => {
            const { colsRows, t, idx, types } = state
            const start = (idx * colsRows[0]) % state.types.length
            const decay = (t * colsRows[0]) % colsRows[0]
            const len = seq ? seq.length % colsRows[0] : SYSTEM.minmaxInt(0, colsRows[0])
            const src = seq ? seq : [state.types[start]]

            // for (let i = 0; i < src.length; i++) {
              state.types[(start+decay+t) % state.types.length] = src[t % src.length] 
            // }
        },
        () => {
            state.stop = SYSTEM.minmaxInt(0, state.colsRows[1]+1)
            state.idx = SYSTEM.minmaxInt(0, state.colsRows[1])
        }
    ]
}

export { state, alter }
