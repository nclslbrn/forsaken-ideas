import GlitchText from './glitchText'

const handleAction = () => {
    window['openOffFrame'] = () => {
        document.body.classList.toggle('openedOffWindow')
        const titleElem = document.getElementById('projectTitle')
        new GlitchText({
            element: titleElem,
            effect: 'add'
        })
    }
    const buttons = document.querySelectorAll('[data-action]')

    if (typeof buttons != 'undefined') {
        for (let b = 0; b < buttons.length; b++) {
            const action = buttons[b].getAttribute('data-action')
            buttons[b].addEventListener(
                'click',
                function () {
                    const calledFunction = window[action]
                    if (typeof calledFunction !== 'function') {
                        console.log(action, ' is not defined')
                    } else {
                        calledFunction()
                    }
                },
                false
            )
        }
    }
}

export default handleAction
