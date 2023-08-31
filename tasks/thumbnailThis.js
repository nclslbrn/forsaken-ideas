const fs = require('fs'),
    path = require('path'),
    gm = require('gm').subClass({ imageMagick: true })
const consoleColours = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m'
}
module.exports = function (sketchName) {
    if (sketchName) {
        const capturePath = path.join(
            path.resolve('sketch'),
            sketchName,
            'capture.jpg'
        )
        const thumbnailPath = path.join(
            path.resolve('sketch'),
            sketchName,
            'thumbnail.jpg'
        )
        if (fs.existsSync(thumbnailPath)) {
            console.log(
                consoleColours.green,
                `✓ ${thumbnailPath} already exists`,
                consoleColours.reset
            )
            return
        }
        if (!fs.existsSync(capturePath)) {
            console.error(
                consoleColours.red,
                `✗ ${thumbnailPath} can't be generated`,
                consoleColours.reset
            )
            return
        }
        gm(capturePath)
            .crop(600, 600, 300, 15)
            .write(thumbnailPath, function (err) {
                if (err) {
                    console.error(err)
                } else {
                    console.log(
                        consoleColours.green,
                        `✓ ${thumbnailPath} generated`,
                        consoleColours.reset
                    )
                }
            })
    } else {
        console.error('A sketch path must be passed to this task')
    }
}
