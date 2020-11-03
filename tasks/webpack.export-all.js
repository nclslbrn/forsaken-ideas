const path = require('path')
const unescapeTitle = require('./unescapeTitle')
const fileList = require('./fileList')
const sketchConfig = require('./sketchConfig')
const projects = fileList(path.resolve('sketch/'))
const projectsConfig = []

for (let p = 0; p < projects.length; p++) {
    const entry = path.join(path.resolve('sketch/'), projects[p], '/index.js')
    const property = require(path.resolve(
        'sketch/' + projects[p] + '/property.json'
    ))
    const title = unescapeTitle(projects[p])
    const output = path.resolve('public/sketch', projects[p])
    projectsConfig[p] = sketchConfig(
        path.resolve('sketch', projects[p]),
        entry,
        output,
        title,
        property,
        'production'
    )
}
module.exports = projectsConfig
