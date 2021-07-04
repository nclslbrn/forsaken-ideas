module.exports = function (str) {
    if (str !== null || str !== '') {
        str = str.toString()
        return str.replace(/(<([^>]+)>)/gi, '')
    } else {
        return ''
    }
}
