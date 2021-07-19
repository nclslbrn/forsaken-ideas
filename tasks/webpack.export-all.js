const path = require('path')
const unescapeTitle = require('./unescapeTitle')
const fileList = require('./fileList')
const sketchConfig = require('./sketchConfig')
const siteUrl = require('./siteUrl')
const stripTags = require('./stripTags')
const author = require('./author')
const { existsSync } = require('fs')
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

    const property = require(path.resolve(
        'sketch/' + projects[p] + '/property.json'
    ))
    property.title = unescapeTitle(projects[p])
    property.mode = 'production'
    property.next = next
    property.previous = previous
    property.path = projects[p]
    property.input = path.resolve('sketch', projects[p])
    property.output = path.resolve('public/sketch', projects[p])
    property.srcPath = '../../'
    property.entry = path.join(
        path.resolve('sketch/'),
        projects[p],
        '/index.js'
    )
    property.siteUrl = siteUrl
    property.author = author
    property.getAssetsToCopy = existsSync(
        path.join(path.resolve('sketch/'), projects[p], 'assets')
    )
    property.imageCover = existsSync(
        path.join(path.resolve('sketch/'), projects[p], 'capture.jpg')
    )
    property.escapedInfo = property.info ? stripTags(property.info) : undefined

    projectsConfig[p] = sketchConfig(property)
}
module.exports = projectsConfig
