import '../../sass/notification.scss'

export default class Notification {
    constructor(message, parentElem) {
        const p = document.createElement('p')
        p.id = 'notification'
        p.innerHTML = message
        parentElem.appendChild(p)
        window.setTimeout(() => {
            parentElem.removeChild(p)
        }, 5000)
    }
}
