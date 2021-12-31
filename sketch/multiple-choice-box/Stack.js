export default class Stack {
    constructor(maxItems, minLength = 0.1) {
        const min = minLength,
            max = 1 - minLength

        this.items = []

        while (this.items.length <= maxItems) {
            this.items.push(Math.random() * (max - min) + min)
        }
        const sum = this.items.reduce((sum, item) => {
            return (sum += item)
        }, 0)
        this.items.forEach((value, index) => {
            this.items[index] /= sum
        })
    }
}
