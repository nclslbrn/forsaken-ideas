import fs from 'fs'
import readJson from './utils/read-json.mjs'
import getCdnTags from './utils/cdn-script-tags.mjs'
import titleFromSlug from './utils/title-from-slug.mjs'
import stripTag from './utils/strip-tag.mjs'
import getMenuItem from './utils/additional-menu-items.mjs'

// Write vite entry point (index.html)
const writeIndexHTML = async (src, sketchDir) => {
    const title = titleFromSlug(src)
    const queryMeta = async function () {
        return Promise.resolve([
            await readJson(`${sketchDir}/property.json`),
            await readJson('site-meta.json')
        ])
    }
    queryMeta().then(async (meta) => {
        const cdnScriptTags = getCdnTags(meta[0].libs)
        const additionalMenuItems = getMenuItem(meta[0].actions)
        const toInject = {
            src,
            title,
            ...meta[0],
            description: meta[0].info 
              ? stripTag(meta[0].info) 
              : 'Coming soon',
            ...meta[1],
            cdnScriptTags,
            additionalMenuItems
        }
        fs.readFile(
            './sketch-template.html',
            'utf-8',
            function (err, contents) {
                err && console.error(err)
                let replaced = contents
                Object.keys(toInject).map((key) => {
                    const regex = new RegExp(`{{${key}}}`, 'g')
                    replaced = replaced.replaceAll(regex, toInject[key])
                })
                fs.writeFile(
                    `${sketchDir}/index.html`,
                    replaced,
                    { encoding: 'utf-8', flag: 'w' },
                    function (err) {
                        err && console.error(err)
                        return true
                    }
                )
                console.log(`✅ ${sketchDir}/index.html`)
            }
        )
    })
}

// Write vite config
const writeViteConfigJs = (src, sketchDir) => {
    fs.readFile(
        './tasks/sketch.vite.config.js',
        'utf-8',
        function (err, contents) {
            err && console.error(err)
            const regex = new RegExp('{{src}}', 'g')
            const replaced = contents.replaceAll(regex, src)
            fs.writeFile(
                `${sketchDir}/vite.config.js`,
                replaced,
                { encoding: 'utf-8', flag: 'w' },
                function (err) {
                    err && console.error(err)
                    return true
                }
            )
        }
    )
    console.log(`✅ ${sketchDir}/vite.config.js`)
}

// Write vite entry point (index.html)
const writeIndexJS = async (src, sketchDir, template) => {
    const title = titleFromSlug(src)
    fs.readFile(
        `./tasks/templates/${template}.js`,
        'utf-8',
        function (err, contents) {
            err && console.error(err)
            let replaced = contents
            const regex = new RegExp(`{{title}}`, 'g')
            replaced = replaced.replaceAll(regex, title)
            fs.writeFile(
                `${sketchDir}/index.js`,
                replaced,
                { encoding: 'utf-8', flag: 'w' },
                function (err) {
                    err && console.error(err)
                    return true
                }
            )
        }
    )
    console.log(`✅ ${sketchDir}/index.js`)
}
export { writeIndexHTML, writeViteConfigJs, writeIndexJS }
