import path from 'path';
import fileList from './utils/file-list.mjs';
import { execSync } from 'child_process';

const projects = fileList(path.resolve('./sketch/'));

for (let i = 0; i < projects.length; i++) {
  if (projects[i] !== 'node_modules') {
    execSync(`yarn run sketch:build ${projects[i]}`)
    console.log(`✅ ${projects[i]}`)
  }
}
