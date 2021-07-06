import '../../sass/notification.scss'
/**
 * Notification class
 * @param {string} message the text to display
 * @param {object} parentElem the node element where append it
 * @param {string} mode dark|light the style of the box
 */
export default class Notification {
    constructor(message, parentElem, mode = 'dark') {
        const p = document.createElement('p')
        p.id = 'notification'
        if (mode == 'dark' || mode == 'light') {
            p.classList.add(mode)
        } else {
            console.error(
                `Undefined mode (${mode}), possible options: dark & light.`
            )
        }
        p.innerHTML = message

        if (parentElem !== undefined) {
            parentElem.appendChild(p)
            window.setTimeout(() => {
                parentElem.removeChild(p)
            }, 5000)
        } else {
            console.error("Parent elem doesn't exist.")
        }
    }
}
