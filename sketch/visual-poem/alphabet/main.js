/*
 * Alphabet object (each letter as a property)
 * letter an array of path/line
 *
 * Modified version of sam.6"s one
 * @url https://gist.github.com/sam.6/909e0f73d66a0d32b06b17ea77c2959b
 */
import { polyline, asCubic, pathFromCubics } from '@thi.ng/geom'; 
import { lowercase } from './lowercase';
import { uppercase } from './uppercase';
import { ponctuation } from './ponctuation';
import { number } from './number';

const alphabet = { ...lowercase, ...uppercase, ...ponctuation, ...number }

const getGlyph = (key) => {
  if (alphabet.hasOwnProperty(key)) {
    return softenGlyph(alphabet[key], key);
  } else {
    return [];
  }
}

const softenGlyph = (glyph, key) => {
  const cubics = glyph.map((line) => asCubic(polyline(line)))

  console.log(key, cubics)
  if (cubics.reduce((con, val) => con && val !== undefined, false)) {
    return cubics.map(c =>pathFromCubics(c).segments)
  } else {
    return glyph
  }
}

export { getGlyph, alphabet} 
