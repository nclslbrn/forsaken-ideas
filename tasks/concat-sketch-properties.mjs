import path from 'path'
import fs from 'fs'
import titleFromSlug from './utils/title-from-slug.mjs'
import readJSON from './utils/read-json.mjs'
import fileList from './utils/file-list.mjs'

const exportCallBack = (err) => console.log(err ? err : 'Sketch list exported')

const exportSketches = (sketchProperties) =>
    fs.writeFile(
        path.resolve('./public/sketch/index.json'),
        JSON.stringify(sketchProperties),
        'utf8',
        exportCallBack
    )

const projects = fileList(path.resolve('./sketch/'))

const sketchProperties = []

for (let i = 0; i < projects.length; i++) {
    if (projects[i] !== 'node_modules') {
        const project = await readJSON(
            path.resolve(`./sketch/${projects[i]}/property.json`)
        )
        sketchProperties.push({
            title: titleFromSlug(projects[i]),
            topic: project.topic,
            date: project.date,
            src: projects[i]
        })
    }
}

exportSketches(sketchProperties)
