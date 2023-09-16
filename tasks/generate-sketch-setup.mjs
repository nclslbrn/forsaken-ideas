import fs from 'fs'
import { confirm } from '@inquirer/prompts';
import { writeIndexHTML, writeViteConfigJs } from './writeSetup.mjs';
//const writeIndexJS = (sketchDir, props) => { }

export default async function (sketchDir, src) {

  if (fs.existsSync(`${sketchDir}/index.html`) || fs.existsSync(`${sketchDir}/vite.config.js`)
  ) {
    const forceWrite = await confirm({
      message: 'A previous configuration exists, overwite it (only index.html and vite.config.js) ?'
    })

    if (forceWrite) {
      try {
        await writeIndexHTML(src, sketchDir)
        writeViteConfigJs(src, sketchDir)
      } catch (err) {
        console.error('Something bad happens, I hope you are in self place \'cause you\'ve to debugg this mess')
        console.error(err)
      }
      console.log(`Your sketch is ready for dev, you can now run "npm run sketch:dev --sketch=${src}"`)
    }

  } else {
    const writeRequest = writeIndexHTML(src, sketchDir)
    writeRequest.then(() => {
      writeViteConfigJs(src, sketchDir)
      console.log(`Your sketch is ready for dev, you can now run "npm run sketch:dev --sketch=${src}"`)
    })
  }

  if (!fs.existsSync(`${sketchDir}/index.js`)) {
    const createSketchEntry = await confirm({
      message: 'Would you like to create the index.js (pointed on index.html) ?'
    })

    if (createSketchEntry) {
      //writeIndexJS(sketchDir)
    }
  }
}