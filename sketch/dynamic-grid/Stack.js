export default class Stack {
    constructor(maxItems) {
        this.maxItems = maxItems
        this.items = []

        while (this.items.length <= maxItems) {
            this.items.push(Math.random())
        }
        const sum = this.items.reduce((sum, item) => {
            return (sum += item)
        }, 0)
        this.items.forEach((value, index) => {
            this.items[index] /= sum
        })
    }
}
