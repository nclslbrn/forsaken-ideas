const switchMode = () => {
    const paramBox = document.createElement('div')
    const p = document.createElement('p')
    p.innerHTML = 'DRAW CURVES AS A SINGLE LINE ?'

    const drawModeLabel = document.createElement('label')
    drawModeLabel.classList.add('switch')
    const switchBar = document.createElement('span')
    const drawModeSwitch = document.createElement('input')
    drawModeSwitch.setAttribute('type', 'checkbox')
    //drawModeSwitch.setAttribute('checked', 'checked')
    drawModeSwitch.addEventListener(
        'change',
        () => (window.drawAsSingleLine = drawModeSwitch.checked ? true : false)
    )
    const slider = document.createElement('span')
    slider.classList.add('slider', 'round')

    drawModeLabel.appendChild(drawModeSwitch)
    drawModeLabel.appendChild(slider)
    switchBar.appendChild(document.createTextNode('NOPE'))
    switchBar.appendChild(drawModeLabel)
    switchBar.appendChild(document.createTextNode('SURE'))

    paramBox.appendChild(p)
    paramBox.appendChild(switchBar)
    document.getElementById('windowFrame').appendChild(paramBox)
}

export default switchMode
