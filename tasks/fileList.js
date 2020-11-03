const path = require('path')
const fs = require('fs')

module.exports = (dir) => {
    function fileList(dir) {
        return fs.readdirSync(dir).reduce(function (projects, file) {
            let name = path.join(dir, file)
            let isDir = fs.statSync(name).isDirectory()
            const excludeDir = [
                '.git',
                '.vscode',
                'node_modules',
                'public',
                'src',
                'tools'
            ]
            if (isDir && !excludeDir.includes(name)) {
                projects.push(file)
            }
            return projects
        }, [])
    }
    return fileList(dir)
}
