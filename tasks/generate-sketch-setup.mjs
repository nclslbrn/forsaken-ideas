import fs from 'fs'
import Enquirer from 'enquirer'
import {
    writeIndexHTML,
    writeViteConfigJs,
    writeIndexJS
} from './writeSetup.mjs'

export default async function (sketchDir, src) {
    const somethingInSketchDir =
        fs.existsSync(`${sketchDir}/index.html`) ||
        fs.existsSync(`${sketchDir}/vite.config.js`) ||
        fs.existsSync(`${sketchDir}/index.js`)

    if (somethingInSketchDir) {
        const confirmOverwrite = new Enquirer.Confirm({
            name: 'question',
            message:
                'A previous configuration exists overwrite it ? ' +
                `Only ${sketchDir}/index.html and ${sketchDir}/vite.config.js`
        })
        confirmOverwrite
            .run()
            .then(async (_) => {
                await writeIndexHTML(src, sketchDir).then(() => {
                  writeViteConfigJs(src, sketchDir)
                  return true
                })
            })
            .catch((err) => { 
                console.error(err)
                return false
            })
            .then(() =>
                console.log(
                    `🚀 ${sketchDir} ready! You can now run (w/ npm or yarn) :` +
                        `\n- npm run sketch:dev --sketch=${src}` +
                        `\n- yarn run sketch:dev ${src}`
                )
            )
    } else {
        const writeRequest = writeIndexHTML(src, sketchDir)
        writeRequest
            .then(() => {
                writeViteConfigJs(src, sketchDir)
                const useAtemplate = new Enquirer.Select({
                    name: 'template',
                    message: `Would you like to start coding with a template ?`,
                    choices: ['no', 'minimal', 'p5', 'umbrella']
                })
                useAtemplate
                    .run()
                    .then(async (template) => {
                        if (template !== 'no') {
                            return await writeIndexJS(src, sketchDir, template)
                        }
                        return true
                    })
                    .catch((err) => {
                        console.error(err)
                        return false
                    })
            })
            .then(() => {
                console.log(
                    `🚀 ${sketchDir} ready! You can now run (w/ npm or yarn) :` +
                        `\n- npm run sketch:dev --sketch=${src}` +
                        `\n- yarn run sketch:dev ${src}`
                )
            })
    }
}
