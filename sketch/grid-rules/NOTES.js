import { frequencies } from '@thi.ng/transducers'

/*
export default [
    ['C4', 261.63],
    ['Db4', 277.18],
    ['D4', 293.66],
    ['Eb4', 311.13],
    ['E4', 329.63],
    ['F4', 349.23],
    ['Gb4', 369.99],
    ['G4', 392.0],
    ['Ab4', 415.3],
    ['A4', 440],
    ['Bb4', 466.16],
    ['B4', 493.88],
    ['C5', 523.25]
]
*/
const FREQ_SEQ_TYPE = ['pentatonic'] // 'chromatic', 'major', 'minor' ]

const generateFreqSeq = (numFreq, tone, type) => {
    const intervals = {
            major: [0, 4, 7, 11, 14, 17, 21, 24, 28, 31, 35, 38],
            minor: [0, 3, 7, 10, 14, 17, 21, 24, 27, 31, 34, 38],
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            pentatonic: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26]
        },
        seq = intervals[type] || intervals.major,
        frequencies = []

    for (let i = 0; i < Math.min(numFreq, 12); i++) {
        //  f = f0 * 2^(n/12)
        const freq = tone * Math.pow(2, seq[i] / 12)
        frequencies.push(Math.round(freq * 100) / 100)
    }

    return frequencies
}

export { FREQ_SEQ_TYPE, generateFreqSeq }
