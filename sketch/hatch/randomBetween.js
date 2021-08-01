const randomFloatBeween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}
const randomIntBetween = (interval = { min: 0, max: 1 }) => {
    return ~~(interval.min + Math.random() * (interval.max - interval.min))
}
export { randomFloatBeween, randomIntBetween }
