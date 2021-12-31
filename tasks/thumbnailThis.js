const fs = require('fs'),
    path = require('path'),
    gm = require('gm').subClass({ imageMagick: true })

;[nodePath, scriptPath, sketchName] = process.argv

if (sketchName) {
    const capturePath = path.join(
        path.resolve(__dirname, '..', sketchName),
        'capture.jpg'
    )

    if (fs.existsSync(capturePath)) {
        const thumbnailPath = path.join(
            path.resolve(__dirname, '..', 'public', sketchName),
            'thumbnail.jpg'
        )
        gm(capturePath)
            .crop(600, 600, 300, 15)
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
