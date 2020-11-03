module.exports = (title) => {
    const unescapeTitle = (title) => {
        const addSpace = title.replace(/-/g, ' ')
        const capitalize = addSpace.charAt(0).toUpperCase() + addSpace.slice(1)
        return capitalize
    }
    return unescapeTitle(title)
}
