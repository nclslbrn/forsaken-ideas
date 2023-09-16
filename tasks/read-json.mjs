import { readFile } from "fs/promises";

export default async function (path) {
  const file = await readFile(path, 'utf-8');
  return JSON.parse(file);
}