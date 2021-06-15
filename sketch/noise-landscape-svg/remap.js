/**
 * P5js map
 *
 * @url https://github.com/processing/p5.js/blob/7375939aa4e4e5ada7381815ace2dcb8a0daa74c/src/math/calculation.js#L451
 * @method map
 * @param  {Number} value  the incoming value to be converted
 * @param  {Number} start1 lower bound of the value's current range
 * @param  {Number} stop1  upper bound of the value's current range
 * @param  {Number} start2 lower bound of the value's target range
 * @param  {Number} stop2  upper bound of the value's target range
 * @param  {Boolean} [withinBounds] constrain the value to the newly mapped range
 * @return {Number}        remapped number
 */

export default function (n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}
