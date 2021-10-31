const path = require('path')
const fileList = require('./fileList')
const projects = fileList(path.resolve('sketch/'))

const topics = []
for (let i = 0; i < projects.length; i++) {
    const projectProperty = require(path.resolve(
        'sketch/' + projects[i] + '/property.json'
    ))

    if (!topics.includes(projectProperty.topic)) {
        topics.push(projectProperty.topic)
    }
}

console.table(topics)
