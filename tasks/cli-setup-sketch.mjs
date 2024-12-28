/* eslint-disable no-undef */
import fs from 'fs'
import Enquirer from 'enquirer'
import generatePropertyJson from './cli-write-sketch-properties.mjs'
import generateSketchSetup from './generate-sketch-setup.mjs'
import titleFromSlug from './utils/title-from-slug.mjs'

if (
    process.env.npm_config_sketch === undefined &&
    process.argv[2] === undefined
) {
    console.log(process.argv[2])
    throw new Error(
        'No project path in command (use --sketch=folder with npm run sketch:setup)'
    )
}

const src = process.env.npm_config_sketch || process.argv[2]
const title = titleFromSlug(src)

console.log(`Generating a vite conf for "${title}"`)

/*
 * Found nothing, ask user if he/she will generate new sketch folder
 */
if (!fs.existsSync(`./sketch/${src}`)) {
    const confirmCreation = new Enquirer.Confirm({
        name: 'question',
        message: `No sketch/${src} found, do you want to create it now ?`
    })
    confirmCreation
        .run()
        .then(async function () {
            console.log(`Creating folder sketch/${src} `)
            fs.mkdir(`sketch/${src}`, { recursive: true }, (err) => {
                if (err) throw err
            })
            await generatePropertyJson(`sketch/${src}`)
            await generateSketchSetup(`sketch/${src}`, src)
        })
        .catch(console.error)
} else {
    /*
     * Empty folder
     */
    if (!fs.existsSync(`./sketch/${src}/property.json`)) {
        console.log("Can't reach sketch properties (property.json)")
        const generateJson = new Enquirer.Confirm({
            message: `Do you want to create it (sketch/${src}/property.json) ?`
        })
        generateJson.run().then(async function () {
            await generatePropertyJson(`sketch/${src}`)
            await generateSketchSetup(`sketch/${src}`, src)
        })
    } else {
        /*
         * Existing property.json, checking other files is useless
         * since user want to reset it (index.html and vite.config.js will be regenerated)
         */
        await generateSketchSetup(`sketch/${src}`, src)
    }
}
