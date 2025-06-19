/**
 * Utility function to create slider to change a sketch parameter
 *
 * @param {object} param initialization object
 * paramter name : {
 *      value: init parameter value,
 *      options : {
 *         min: minimum parameter value,
 *         max: maximum value,
 *         step: step to increment value
 *         label: explicit name or false
 *      },
 *      callback: a function to call when slider value change (() => window.init())
 * }
 */
const paramSlider = (param, paramName = false) => {
    let label = ''
    if (param.options.label) {
        label = document.createElement('label')
        label.innerHTML = param.options.label
    }
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = param.options.min
    slider.max = param.options.max
    slider.step = param.options.step
    slider.value = param.value
    if (paramName) {
        slider.name = paramName
    }
    const value = document.createElement('input')
    value.type = 'text'
    value.value = param.value

    slider.addEventListener('change', (event) => {
        param.value = Number(event.target.value)
        value.value = event.target.value
        if (param.callback !== 'undefined') {
            param.callback()
        }
    })

    return [label, slider, value]
}

export default paramSlider
