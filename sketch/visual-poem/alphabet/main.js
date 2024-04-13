/*
 * Alphabet object (each letter as a property)
 * letter an array of path/line
 *
 * Modified version of sam.6"s one
 * @url https://gist.github.com/sam.6/909e0f73d66a0d32b06b17ea77c2959b
 */

import { lowercase } from './lowercase';
import { uppercase } from './uppercase';
import { ponctuation } from './ponctuation';
import { number } from './number';

const alphabet = { ...lowercase, ...uppercase, ...ponctuation, ...number }

const getGlyph = (key) => {
  if (alphabet.hasOwnProperty(key)) {
    return alphabet[key];
  } else {
    return [];
  }
}

export { getGlyph, alphabet} 
