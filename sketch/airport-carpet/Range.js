export default class Range {
    constructor(maxItems) {
        this.maxItems = maxItems
        this.items = []

        for (let i = 1; i <= this.maxItems; i++) {
            this.items.push(Math.random())
        }
        const sum = this.items.reduce((acc, val) => (acc += val))
        this.items = this.items.map((val) => (val /= sum))
    }
}
