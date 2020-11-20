const path = require('path')
const unescapeTitle = require('./unescapeTitle')
const fileList = require('./fileList')

const alphabet = [...'abcdefghijklmnopqrstuvwxyz']
const projects = fileList(path.resolve('sketch/'))
const primer = []

for (const letter of alphabet) {
    const letterProjects = []
    for (const title of projects) {
        if (title.charAt(0) === letter) {
            letterProjects.push(title)
        }
    }
    primer.push({
        letter: letter,
        count: letterProjects.length,
        project: letterProjects
    })
}

const emptyLetter = primer.reduce((acc, entry) => {
    return entry.count === 0 ? [...acc, entry.letter] : acc
}, [])

console.table(primer, ['letter', 'count', 'project'])
console.log(
    `These letters ${
        emptyLetter.length
    } doesn't have project : \r\n${emptyLetter.join('\r\n').toUpperCase()}`
)
