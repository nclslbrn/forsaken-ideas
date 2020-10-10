const path = require('path')
const sketchConfig = require('./webpack/sketchConfig')
const unescapeTitle = require('./webpack/unescapeTitle')

module.exports = (env, argv) => {
    const project = argv._[0]
    let folder = JSON.parse(JSON.stringify(project))
    folder = folder.split('/').pop()
    title = unescapeTitle(folder)
    const entry = project + '/index.js'
    const output = path.resolve(__dirname, 'public/sketch/', folder)
    console.log(output)
    const property = require(project + '/property.json')
    const mode = argv.mode == 'production' ? 'production' : 'development'

    if (project && entry && property && title && mode) {
        return sketchConfig(project, entry, output, title, property, mode)
    } else {
        console.log(
            'You must specified a project/folder name npm run watch/export <project-name>'
        )
        process.exit()
    }
}
