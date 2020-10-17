const path = require('path')
const sketchConfig = require('./webpack/sketchConfig')
const unescapeTitle = require('./webpack/unescapeTitle')

module.exports = (env, process) => {
    const project = process.entry
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
        console.log(
            'You must specified a project/folder name npm run watch/export <project-name>'
        )
        process.exit()
    }
}
