const randomFloatBeween = (interval = { min: 0, max: 1 }) => {
    return Math.random() * (interval.max - interval.min + 1) + interval.min
}
const randomIntBetween = (interval = { min: 0, max: 1 }) => {
    return Math.floor(
        Math.random() * (interval.max - interval.min + 1) + interval.min
    )
}
export { randomFloatBeween, randomIntBetween }
