const path = require('path')
const unescapeTitle = require('./unescapeTitle')
const fileList = require('./fileList')
const sketchConfig = require('./sketchConfig')
const projects = fileList(path.resolve('sketch/'))
const projectsConfig = []

for (let p = 0; p < projects.length; p++) {
    // project navigation
    const prevProject = p > 0 ? projects[p - 1] : false
    const nextProject = p < projects.length - 1 ? projects[p + 1] : false
    const previous = {
        title: prevProject ? unescapeTitle(prevProject) : false,
        link: prevProject ? `../${prevProject}/` : false
    }
    const next = {
        title: nextProject ? unescapeTitle(nextProject) : false,
        link: nextProject ? `../${nextProject}/` : false
    }

    const entry = path.join(path.resolve('sketch/'), projects[p], '/index.js')
    const property = require(path.resolve(
        'sketch/' + projects[p] + '/property.json'
    ))
    property.next = next
    property.previous = previous

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
