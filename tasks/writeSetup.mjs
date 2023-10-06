import fs from 'fs'
import readJson from './read-json.mjs'
import getCdnTags from './cdn-script-tags.mjs';
import titleFromSlug from './title-from-slug.mjs';
import stripTag from './strip-tag.mjs'
import getMenuItem from './additional-menu-items.mjs'

const DEBUGG = true

// Write vite entry point (index.html)
const writeIndexHTML = async (src, sketchDir) => {
  const title = titleFromSlug(src)
  const sketchProps = await readJson(`${sketchDir}/property.json`);
  const siteProps = await readJson('site-meta.json');
  sketchProps.description = stripTag(sketchProps.info)

  const cdnScriptTags = getCdnTags(sketchProps.libs)
  const additionalMenuItems = getMenuItem(sketchProps.action)
  const toInject = { src, title, ...sketchProps, ...siteProps, cdnScriptTags, additionalMenuItems }

  fs.readFile('./sketch-template.html', 'utf-8', function (err, contents) {
    if (DEBUGG && err) console.error(err)
    let replaced = contents
    Object.keys(toInject).map(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      replaced = replaced.replaceAll(regex, toInject[key])
    })
    fs.writeFile(
      `${sketchDir}/index.html`, 
      replaced, 
      { encoding: 'utf-8', flag:'w' }, 
      function (err) {
      if (DEBUGG && err) console.error(err)
      return true
    })
  })
}

// Write vite config
const writeViteConfigJs = (src, sketchDir) => {
  fs.readFile('./tasks/sketch.vite.config.js', 'utf-8', function (err, contents) {
    if (DEBUGG && err) console.error(err)
    const regex = new RegExp('{{src}}', 'g')
    const replaced = contents.replaceAll(regex, src)
    fs.writeFile(
      `${sketchDir}/vite.config.js`, 
      replaced, 
      {encoding: 'utf-8', flag:'w'}, 
      function (err) {
      if (DEBUGG && err) console.error(err)
      // console.log(`${sketchDir}/vite-config.js saved`)
      return true
    })
  })
}


export { writeIndexHTML, writeViteConfigJs }