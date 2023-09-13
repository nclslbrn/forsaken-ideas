import './progressBar.css'

export default class ProgressBar {
    constructor(parentElem, initialValue) {
        if (parentElem !== undefined && initialValue !== undefined) {
            this.elem = document.createElement('div')
            this.elem.id = 'progressBar'
            this.elem.style.width = initialValue + '%'
            this.initialValue = initialValue
            parentElem.appendChild(this.elem)
        } else {
            console.error("We can't initialize progress bar.")
        }
    }
    reset () {
        this.elem.style.width = this.initialValue + '%'
    }
    update (percent) {
        this.elem.style.width = percent + '%'
    }
}
