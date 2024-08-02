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
                `Only ${sketchDir}/index.html and ${sketchDir}vite.config.js`
        })
        confirmOverwrite
            .run()
            .then(async (_) => {
                return async (src) => {
                    await writeIndexHTML(src, sketchDir)
                    writeViteConfigJs(src, sketchDir)
                    console.log(
                        `Your sketch is ready for dev, you can now run (w/ npm or yarn) :` +
                            `\n- npm run sketch:dev --sketch=${src}` +
                            `\n- yarn run sketch:dev ${src}`
                    )
                }
            })
            .catch(console.error)
    } else {
        const writeRequest = writeIndexHTML(src, sketchDir)
        writeRequest.then(() => {
            writeViteConfigJs(src, sketchDir)
            const useAtemplate = new Enquirer.Select({
                name: 'template',
                message: `Would you like to start coding with a template ?`,
                choices: ['no', 'minimal', 'p5', 'umbrella']
            })
            useAtemplate
                .run()
                .then(async (template) => {
                    console.log(template)
                    await writeIndexJS(src, sketchDir, template)
                    console.log(
                        `Your sketch is ready for dev, you can now run (w/ npm or yarn) :` +
                            `\n- npm run sketch:dev --sketch=${src}` +
                            `\n- yarn run sketch:dev ${src}`
                    )
                })
                .catch(console.error)
        })
    }
}
