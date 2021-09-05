import { prepare } from 'svg.js'

const progressStyleAttributes = [
    'margin: 15px',
    'padding: 10px'
    //'border-radius: 2px'
    //'box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset'
]

export default class ProgressBar {
    constructor(parentElem, initialValue) {
        if (parentElem !== undefined && initialValue !== undefined) {
            this.elem = document.createElement('progress')
            this.elem.setAttribute('max', '1')
            this.elem.setAttribute('value', initialValue)
            this.elem.style = progressStyleAttributes.join(';')
            this.initialValue = initialValue
            parentElem.appendChild(this.elem)
        } else {
            console.error("We can't initialize progress bar.")
        }
    }
    reset() {
        this.elem.setAttribute('value', this.initialValue)
    }
    update(percent) {
        this.elem.setAttribute('value', percent)
    }
}
