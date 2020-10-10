const path = require('path')
const unescapeTitle = require('./webpack/unescapeTitle')
const fileList = require('./webpack/fileList')
const sketchConfig = require('./webpack/sketchConfig')
const projects = fileList('./sketch/')
const projectsConfig = []

for (let p = 0; p < projects.length; p++) {
    const entry = './sketch/' + projects[p] + '/index.js'
    const property = require('./sketch/' + projects[p] + '/property.json')
    const title = unescapeTitle(projects[p])
    const output = path.resolve(__dirname, 'public/sketch', projects[p])
    projectsConfig[p] = sketchConfig(
        projects[p],
        entry,
        output,
        title,
        property,
        'production'
    )
}
module.exports = projectsConfig
