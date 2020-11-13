/**
 * Ease function adapted from processing
 * @param {float} p the var (between 0 & 1) to ease
 * @author beesandbombs https://gist.github.com/beesandbombs
 */

const ease = (p, g = false) => {
    if (g) {
        return p < 0.5
            ? 0.5 * Math.pow(2 * p, g)
            : 1 - 0.5 * Math.pow(2 * (1 - p), g)
    } else {
        return 3 * p * p - 2 * p * p * p
    }
}
export default ease
