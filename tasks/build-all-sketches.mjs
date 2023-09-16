import path from 'path';
import fileList from './file-list.mjs';
import { execSync } from 'child_process';

const projects = fileList(path.resolve('./sketch/'));

for (let i = 0; i < projects.length; i++) {
  execSync(`npm run sketch:build --sketch=${projects[i]}`)
}
