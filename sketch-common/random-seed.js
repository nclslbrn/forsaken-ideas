import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'

const getRandSeed = () =>
    `0x${Math.floor(16e16 * Math.random()).toString(16)}`

const saveSeed = (seed) => {
    if (!seed && seed === null) return
    // Retrive and parse old saved seeds
    const stored = localStorage.getItem('seeds')
    const previous = stored ? JSON.parse(stored) : false
    // Check if seed is already saved
    if (previous && previous.filter((item) => item[1] === seed).length > 0) return

    // Add the new one on the local storage
    const toStore = [
        ...(previous ? previous : []),
        [FMT_yyyyMMdd_HHmmss(), seed]
    ]
    localStorage.setItem('seeds', JSON.stringify(toStore))
}

const getSavedSeed = () => {
    const stored = localStorage.getItem('seeds')
    return stored ? JSON.parse(stored) : []
}

const removeSeed = (seed) => {
    if (!seed && seed === null) return
    // Retrive and parse old saved seeds
    const stored = localStorage.getItem('seeds')
    const previous = stored ? JSON.parse(stored) : false
    // Check if seed is already saved
    if (!previous) return

    // Add the new one on the local storage
    const toStore = previous.filter((entry) => entry[1] !== seed) 
    localStorage.setItem('seeds', JSON.stringify(toStore))
}

const cleanSavedSeed = () => localStorage.setItem('seeds', '')

export { getRandSeed, saveSeed, getSavedSeed, removeSeed, cleanSavedSeed }
