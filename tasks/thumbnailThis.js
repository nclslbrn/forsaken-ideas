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
        if (fs.existsSync(capturePath)) {
            const thumbnailPath = path.join(
                path.resolve('sketch'),
                sketchName,
                'thumbnail.jpg'
            )
            gm(capturePath)
                .crop(600, 600, 300, 15)
                .write(thumbnailPath, function (err) {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log(
                            consoleColours.green,
                            `✓ ${thumbnailPath}`,
                            consoleColours.reset
                        )
                    }
                })
        } else {
            console.error(
                consoleColours.red,
                `✗ ${capturePath}.`,
                consoleColours.reset
            )
        }
    } else {
        console.error('A sketch path must be passed to this task')
    }
}
