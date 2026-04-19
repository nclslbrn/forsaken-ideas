import { spawn } from 'child_process'
import process from 'node:process'
import path from 'path'
import 'dotenv/config'

// Warning this script use lftp to transfert files on your remote server,
// you nedd to install it on your OS
// https://lftp.yar.ru/

const project = process.argv[2]
if (!project) {
    throw Error(
        `You must pass the project directory name to the npm script (yarn run sketch:deploy PROJECT-DIRECTORY-NAME)`
    )
}
const CONF = ['FTP_HOST', 'FTP_USER', 'FTP_PSWD', 'FTP_PATH'].reduce(
    (conf, setting) => {
        if (process.env[setting]) {
            Object.assign(conf, { [setting]: process.env[setting] })
            return conf
        } else {
            throw Error(`${setting} key not found in your .env`)
        }
    },
    {}
)

const sourcePath = path.resolve('public', 'sketch', project),
    destinationPath = `${CONF.FTP_PATH}sketch/${project}`

const lftp = spawn(
    'lftp',
    [
        '-u',
        `${CONF.FTP_USER},${CONF.FTP_PSWD}`,
        `ftp://${CONF.FTP_HOST}`,
        '-e',
        `mirror -R --delete ${sourcePath} ${destinationPath}; bye`
    ],
    { stdio: 'inherit' }
)

lftp.on('close', function (code) {
    if (code !== 0) {
        console.log('Failed: ' + code)
    }
})
