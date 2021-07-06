const fs = require('fs')
const path = require('path')
const sketchConfig = require('./sketchConfig')
const unescapeTitle = require('./unescapeTitle')
const fileList = require('./fileList')
const projects = fileList(path.resolve('sketch/'))
const siteUrl = require('./siteUrl')
const stripTags = require('./stripTags')
const author = require('./author')

module.exports = (env, process) => {
    const project = process.entry[0]
    const getAssetsToCoppy = fs.existsSync(
        path.join(project.toString(), 'assets')
    )
    const getImageCover = fs.existsSync(
        path.join(project.toString(), 'capture.jpg')
    )
    const folder = JSON.parse(JSON.stringify(project))
        .toString()
        .split('/')
        .pop()

    const property = require(project + '/property.json')
    property.mode = process.mode == 'production' ? 'production' : 'development'
    property.url = `${siteUrl}/sketch/${folder}`
    property.input = project
    property.title = unescapeTitle(folder)
    property.entry = path.join(project, '/index.js')
    property.output = path.resolve('public/sketch/', folder)
    property.srcPath = '../../'
    property.path = folder
    property.getAssetsToCoppy = getAssetsToCoppy
    property.imageCover = getImageCover
        ? property.url + 'capture.jpg'
        : undefined
    property.escapedInfo = property.info ? stripTags(property.info) : undefined
    property.siteUrl = siteUrl
    property.author = author

    const current = projects.indexOf(folder)
    const prevProject = current > 0 ? projects[current - 1] : false
    const nextProject =
        current < projects.length - 1 ? projects[current + 1] : false

    property.previous = {
        title: prevProject ? unescapeTitle(prevProject) : false,
        link: prevProject ? `../${prevProject}/` : false
    }
    property.next = {
        title: nextProject ? unescapeTitle(nextProject) : false,
        link: nextProject ? `../${nextProject}/` : false
    }

    if (property) {
        return sketchConfig(property)
    } else {
        process.exitCode = 128
        throw new Error(
            'Entry path is incorrect. Syntax npm run export-sketch ./<sketch>/<project-folder>'
        )
    }
}
