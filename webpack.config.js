const path = require('path')
const sketchConfig = require('./webpack/sketchConfig')
const unescapeTitle = require('./webpack/unescapeTitle')

module.exports = (env, process) => {
    const project = process.entry[0]
    const folder = JSON.parse(JSON.stringify(project))
        .toString()
        .split('/')
        .pop()
    const title = unescapeTitle(folder)
    const entry = project + '/index.js'
    const output = path.join(__dirname, 'public/sketch/', folder)

    console.log('<', output)

    const property = require(project + '/property.json')
    const mode = process.mode == 'production' ? 'production' : 'development'

    if (project && entry && property && title && mode) {
        return sketchConfig(project, entry, output, title, property, mode)
    } else {
        process.exitCode = 128
        throw new Error(
            'Entry path is incorrect. Syntax npm run export-sketch ./<sketch>/<project-folder>'
        )
    }
}
