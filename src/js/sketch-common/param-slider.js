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
 *      }
 * }
 * If you want to call a function after param change,
 * you have to set a sketch.init function
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
        param.value = event.target.value
        value.value = event.target.value
        if (typeof init == 'function') {
            init()
        }
    })
    return [label, slider, value]
}

export default paramSlider
