import { spawn }  from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const folderName = process.argv[2];
const command = process.argv[3] || 'dev';


if (!folderName) {
  console.error('Usage: node scripts/sketch.js <folder-name> [dev|build]');
  process.exit(1);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(
  __dirname, '../', 'sketch', folderName //, 'vite.config.js'
);
const viteCommand = command === 'build' ? 'build' : 'dev';

console.log(configPath)

const args = ['vite', viteCommand];
const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  // cwd: process.cwd(),
  cwd: configPath
});

child.on('exit', (code) => {
  process.exit(code || 0);
});