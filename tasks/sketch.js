import { spawn }  from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const folderName = process.argv[2];
const command = process.argv[3] || 'dev';


if (!folderName) {
  console.error('Missing sketch folder name. Usage: [npm|yarn] run sketch <folder-name> [dev|build]');
  process.exit(1);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const child = spawn(`npx vite ${command === 'build' ? 'build' : 'dev'}`,{
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '../', 'sketch', folderName)
});

child.on('exit', (code) => {
  process.exit(code || 0);
});