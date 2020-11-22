import GlitchText from '../gallery/glitchText'

const handleAction = (possibles_action) => {
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
                function (event) {
                    const calledFunction = window[action]
                    calledFunction()
                },
                false
            )
        }
    }
}

export default handleAction
