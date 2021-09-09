import '../../sass/notification.scss'
/**
 * Notification class
 * @param {string} message the text to display
 * @param {object} parentElem the node element where append it
 * @param {string} mode dark|light the style of the box
 */
export default class Notification {
    constructor(message, parentElem, mode = 'dark', duration = 5000) {
        this.elem = document.createElement('p')
        this.elem.id = 'notification'
        if (mode == 'dark' || mode == 'light') {
            this.elem.classList.add(mode)
        } else {
            console.error(
                `Undefined mode (${mode}), possible options: dark & light.`
            )
        }
        this.elem.innerHTML = message

        if (parentElem !== undefined) {
            this.parentElem = parentElem
            parentElem.appendChild(this.elem)
            if (duration) {
                window.setTimeout(() => {
                    parentElem.removeChild(this.elem)
                }, duration)
            }
        } else {
            this.parentElem = false
            console.error("Parent elem doesn't exist.")
        }
    }
    remove() {
        if (this.parentElem) {
            this.parentElem.removeChild(this.elem)
        }
    }
}
