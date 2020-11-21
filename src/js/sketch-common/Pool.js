export default class Pool {
    constructor(maxItems) {
        this.maxItems = maxItems
        this.items = []
    }
    update() {
        this.items = []
        let remaining = 1

        for (let i = 1; i <= this.maxItems; i++) {
            if (remaining > 0) {
                const item = Math.random(i / this.maxItems) * remaining
                this.items.push(item)
                remaining -= item
            } else {
                this.items.push(0)
            }
        }
    }
    getItems() {
        return this.items
    }
}
