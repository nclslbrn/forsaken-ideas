import GlitchText from './glitchText'

const handleAction = () => {
    window['openOffFrame'] = () => {
        document.body.classList.toggle('openedOffWindow')
        if (document.body.classList.contains('openedOffWindow')) {
            const titleElem = document.getElementById('projectTitle')
            new GlitchText({
                element: titleElem,
                effect: 'add'
            })
        }
    }
    window['back'] = () => {
        // Check if user comes from the index (browser history) then redirect him to index
        if (
            document.referrer &&
            document.referrer.indexOf(
                location.protocol + '//' + location.host
            ) > -1
        ) {
            history.back()
        } else {
            window.location.href = '/'
        }
    }
    const buttons = document.querySelectorAll('button[data-action]')

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
