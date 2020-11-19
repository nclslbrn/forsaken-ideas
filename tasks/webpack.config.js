const path = require('path')
const sketchConfig = require('./sketchConfig')
const unescapeTitle = require('./unescapeTitle')
const fileList = require('./fileList')
const projects = fileList(path.resolve('sketch/'))

module.exports = (env, process) => {
    const project = process.entry[0]
    const folder = JSON.parse(JSON.stringify(project))
        .toString()
        .split('/')
        .pop()
    const title = unescapeTitle(folder)
    const entry = path.join(project, '/index.js')
    const output = path.resolve('public/sketch/', folder)

    console.log('<', output)

    const property = require(project + '/property.json')
    const current = projects.indexOf(folder)
    const prevProject = current > 0 ? projects[current - 1] : false
    const nextProject =
        current < projects.length - 1 ? projects[current + 1] : false

    console.log(projects, project + ' = ' + current, prevProject, nextProject)

    property.previous = {
        title: prevProject ? unescapeTitle(prevProject) : false,
        link: prevProject ? `../${prevProject}/` : false
    }
    property.next = {
        title: nextProject ? unescapeTitle(nextProject) : false,
        link: nextProject ? `../${nextProject}/` : false
    }
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
