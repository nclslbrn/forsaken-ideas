module.exports = (title) => {
    const unescapeTitle = (title) => {
        const addSpace = title.replace(/-/g, ' ')
        const addQuote = addSpace.replace(/_/g, '\'')
	const capitalize = addQuote.charAt(0).toUpperCase() + addQuote.slice(1)
        return capitalize
    }
    return unescapeTitle(title)
}
