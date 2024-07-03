/* eslint-disable no-undef */
import fs from 'fs';
import { confirm } from '@inquirer/prompts';
import generatePropertyJson from './generate-property-json.mjs';
import generateSketchSetup from './generate-sketch-setup.mjs';
import titleFromSlug from './title-from-slug.mjs';

if (process.env.npm_config_sketch === undefined && process.argv[2] === undefined) {
  console.log(process.argv[2])
  throw new Error('No project path in command (use --sketch=folder with npm run sketch:setup)')
} 

const src = process.env.npm_config_sketch || process.argv[2]
const title = titleFromSlug(src)


console.log('Generating a vite conf for', title)
// Found nothing
if (!fs.existsSync(`./sketch/${src}`)) {
  const generateFolder = await confirm({
    message: `Sketch folder not reachable (sketch/${src}), do you want to create it now ?`
  })
  if (generateFolder) {
    console.log(`Creating folder sketch/${src} `)
    fs.mkdir(`sketch/${src}`, { recursive: true }, (err) => { if (err) throw err; })
    await generatePropertyJson(`sketch/${src}`)
    await generateSketchSetup(`sketch/${src}`, src)
  }
}
// Sketch found create the setup
else {
  if (!fs.existsSync(`./sketch/${src}/property.json`)) {
    console.log('Sketch property.json not found')
    const generateJson = await confirm({
      message: `Do you want to create it (sketch/${src}/property.json) ?`
    })
    if (generateJson) {
      await generatePropertyJson(`sketch/${src}`)
      await generateSketchSetup(`sketch/${src}`, src)
    }
  } else {
    await generateSketchSetup(`sketch/${src}`, src)
  }
}
