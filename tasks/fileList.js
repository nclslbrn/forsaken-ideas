const path = require('path')
const fs = require('fs')

module.exports = (dir) => {
    function fileList(dir) {
        return fs.readdirSync(dir).reduce(function (projects, file) {
            let name = path.join(dir, file)
            let isDir = fs.statSync(name).isDirectory()

            if (isDir) {
                projects.push(file)
            }
            return projects
        }, [])
    }
    return fileList(dir)
}
