export default function (slug) {
  const addSpace = slug.replace(/-/g, ' ')
  const addQuote = addSpace.replace(/_/g, '\'')
  const capitalize = addQuote.charAt(0).toUpperCase() + addQuote.slice(1)
  return capitalize
}
