/**
 * Generate multiple colors
 *
 * Caution: to use in p5 you have to se the colorMode to HSL, 360, 100, 100, 100
 *
 * @param {int} saturation in percent the saturation of the returned colors
 * @param {int} lightness in percent the brightness value of generated colors
 * @param {int} alpha in percent the alpha value of returned colors
 * @param {int} amount how many color you want
 */
const generateHslaColors = (
    saturation = 75,
    lightness = 75,
    alpha = 100,
    amount
) => {
    const colors = []
    const hueBegin = Math.floor(Math.random() * 360)
    const hueDelta = Math.trunc(360 / amount)
    let hue = hueBegin

    for (let i = 0; i < amount; i++) {
        hue += hueDelta
        hue = hue > 360 ? hue % 360 : hue
        colors.push([hue, saturation, lightness, alpha])
    }

    return colors
}

export { generateHslaColors }
