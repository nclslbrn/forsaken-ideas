import path from 'path'
import fs from 'fs'

export default function (dir) {
    return fs.readdirSync(dir).reduce(function (projects, file) {
        let name = path.join(dir, file)
        let isDir = fs.statSync(name).isDirectory()
        if (isDir) {
            projects.push(file)
        }
        return projects
    }, [])
}
