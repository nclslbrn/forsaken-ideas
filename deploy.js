const FtpDeploy = require('ftp-deploy')
const ftp = new FtpDeploy()
const fs = require('fs')

const rawdata = fs.readFileSync('ftp.json')
const server = JSON.parse(rawdata)

const config = {
    ...server,
    localRoot: __dirname + '/public/',
    remoteRoot: '/www/',
    include: ['*', '**/*'],
    deleteRemote: false,
    forcePasv: true
}

ftp.deploy(config)
    .then((res) => console.log('Finished', res))
    .catch((err) => console.log(err))

ftp.on('uploading', function (data) {
    data.totalFilesCount
    data.transferredFileCount
    data.filename
})
ftp.on('uploaded', function (data) {
    console.log(data)
})
ftp.on('log', function (data) {
    console.log(data)
})
