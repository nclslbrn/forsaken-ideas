const handleAction = (possibles_action) => {

    const buttons = document.querySelectorAll('[data-action]')

    if (typeof (buttons) != 'undefined') {
        for (let b = 0; b < buttons.length; b++) {

            const action = buttons[b].getAttribute('data-action')
            buttons[b].addEventListener('click', function (event) {

                const calledFunction = window[action]
                calledFunction()

            }, false)
        }
    }
}

export default handleAction