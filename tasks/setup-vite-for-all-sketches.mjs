/* eslint-disable no-undef */
import path from 'path';
import fileList from './utils/file-list.mjs';
import { writeIndexHTML, writeViteConfigJs } from './writeSetup.mjs';

const projects = fileList(path.resolve('./sketch/'));

for (let i = 0; i < projects.length; i++) {
  const sketchDir = `sketch/${projects[i]}`
  try {
    await writeIndexHTML(projects[i], sketchDir)
    writeViteConfigJs(projects[i], sketchDir)
  } catch (err) {
    console.error(err)
  }
  console.log(`${projects[i]} ready`)
}
