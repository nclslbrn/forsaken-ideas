const paramSlider = (param) => {
    const label = document.createElement('label')
    label.innerHTML = param.options.label
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = param.options.min
    slider.max = param.options.max
    slider.step = param.options.step
    slider.value = param.value
    const value = document.createElement('input')
    value.type = 'text'
    value.value = param.value

    slider.addEventListener('change', (event) => {
        param.value = event.target.value
        value.value = event.target.value
        init()
    })
    return [label, slider, value]
}

export default paramSlider
