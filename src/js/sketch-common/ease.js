/**
 * Ease function adapted from processing
 * @param {float} p the var (between 0 & 1) to ease
 * @author beesandbombs https://gist.github.com/beesandbombs
 */

const ease = (p) => {
    return 3 * p * p - 2 * p * p * p
}

export default ease
