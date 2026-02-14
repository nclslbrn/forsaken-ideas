const PATTERNS = ['up', 'down', 'upDown', 'downUp', 'random', 'bounce']

const arpeggio = (baseNotes, octaves, patternType) => {
    let notes = []

    // Generate notes across octaves
    for (let oct = 0; oct < octaves; oct++) {
        for (let note of baseNotes) {
            notes.push({
                ...note,
                frequency: note.frequency * Math.pow(2, oct),
                duration: note.duration > 120 ? note.duration / 3 : 120
            })
        }
    }

    // Apply pattern
    switch (patternType) {
        case 'up':
            return notes
        case 'down':
            return [...notes].reverse()
        case 'upDown':
            return [...notes, ...notes.slice(0, -1).reverse()]
        case 'downUp':
            const reversed = [...notes].reverse()
            return [...reversed, ...reversed.slice(0, -1).reverse()]
        case 'random':
            return notes.sort(() => Math.random() - 0.5)
        case 'bounce':
            return [
                notes[0],
                notes[notes.length - 1],
                notes[1],
                notes[notes.length - 2]
            ]
        default:
            return notes
    }
}

export { PATTERNS, arpeggio }
