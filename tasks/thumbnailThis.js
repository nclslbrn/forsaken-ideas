const fs = require('fs'),
    path = require('path'),
    gm = require('gm').subClass({ imageMagick: true })

;[nodePath, scriptPath, sketchName] = process.argv

if (sketchName) {
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
                    console.log(`✓ ${thumbnailPath}`)
                }
            })
    } else {
        console.error(`✗ ${capturePath}.`)
    }
} else {
    console.error('A sketch path must be passed to this task')
}
