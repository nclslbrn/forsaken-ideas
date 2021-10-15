const fs = require('fs'),
    path = require('path'),
    fileList = require('./fileList')
gm = require('gm').subClass({ imageMagick: true })

const projects = fileList(path.resolve('sketch/'))
const consoleColours = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m'
}

for (const sketchName of projects) {
    const capturePath = path.join(
        path.resolve('sketch', sketchName),
        'capture.jpg'
    )
    if (fs.existsSync(capturePath)) {
        const thumbnailPath = path.join(
            path.resolve('public/sketch', sketchName),
            'capture-380x200px.jpg'
        )
        gm(capturePath)
            .resize(380, 200, '!')
            .write(thumbnailPath, function (err) {
                if (err) {
                    console.error(err)
                } else {
                    console.log(
                        consoleColours.green,
                        `✓ ${sketchName}`,
                        consoleColours.reset
                    )
                }
            })
    } else {
        console.error(
            consoleColours.red,
            `✗ ${sketchName} (no capture.jpg found)`,
            consoleColours.reset
        )
    }
}
