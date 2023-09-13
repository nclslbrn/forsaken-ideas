/* eslint-disable no-undef */
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import buble from '@rollup/plugin-buble';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint';
import postcss from 'rollup-plugin-postcss'
import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import html from '@rollup-extras/plugin-html';
import serve from 'rollup-plugin-serve'

import readJson from './tasks/readJSON.mjs'
import stripTag from './tasks/stripTag.mjs'
import titleFromSlug from './tasks/titleFromSlug.mjs'
import htmlSketchTemplate from './tasks/html-sketch-template.mjs'

// `npm run sketch:build` -> `production` is true
// `npm run sketch:dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;
const lastCommandArg = process.argv.slice(-1)[0];

// Check if --sketch=something and stop script if no sketch directory specified
if (
  process.env.npm_config_sketch == undefined &&
  '--config-sketch=' !== lastCommandArg.slice(0, 16)
) {
  console.error('No project path in command :')
  console.error('Use --sketch=folder (with npm)')
  console.error('Use --config-sketch=folder (with yarn)')
  process.exit(0)
}

// Get site meta (author and url)
const siteProps = await readJson('site-meta.json')

// Get project meta (description, lib, action, topic, date and info)
const src = process.env.npm_config_sketch || lastCommandArg.replace('--config-sketch=', '');

const title = titleFromSlug(src);
const sketchProps = await readJson(`./sketch/${src}/property.json`)
sketchProps.description = stripTag(sketchProps.info)

// Base input and output directory
const dirs = {
  src: path.join(path.resolve('sketch'), src),
  dest: path.join(path.resolve('public'), 'sketch', src)
}

// Default assets 
// - thumbnail for homepage preview
// - capture for OpenGraph preview)
const assets = [
  { src: [`${dirs.src}/capture.jpg`, `${dirs.src}/thumbnail.jpg`], dest: dirs.dest }
]
// Additional assets if the sketch require extra files (fonts, images...)
if (fs.existsSync(`${dirs.src}/assets`)) {
  assets.push({
    src: `${dirs.src}/assets/**/*`, dest: `${dirs.dest}/assets/`
  })
}

// Create a contextual (relative to --config-project) 
// dev and build configuration 
export default {
  input: `${dirs.src}/index.js`,
  output: {
    file: `${dirs.dest}/bundle.js`,
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: production ? false : 'inline',
    globals: {
      p5: 'p5',
      'p5.Collide2D': 'p5.Collide2D',
      'p5.js-svg': 'p5.jsSVG',
      'p5.dom': 'p5.dom',
      'p5.sound': 'p5.sound',
      'p5.createLoop': 'p5.createLoop',
      three: 'THREE',
      gif: 'gif.js',
    }
  },
  plugins: [
    nodeResolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    eslint({
      include: [
        resolve(`./sketch/${src}/**.js`),
        resolve(`./sketch-common/**.js`)
      ]
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
      extensions: ['.js', '.html'],
      babelHelpers: 'bundled'
    }),
    buble({
      exclude: '**/*.css'
    }),
    postcss({ extract: production ? true : 'style.css' }),
    !production && serve({
      contentBase: [
        dirs.dest,
        `./public/sketch`
      ]
    }),
    html({
      template: htmlSketchTemplate(src, title, sketchProps, siteProps)
    }),
    copy({ targets: [...assets] }),
    production && terser() // minify, but only in production
  ],
  external: [ // Library loaded from CDN
    'p5',
    'three',
    'THREE',
    'p5.Collide2D',
    'p5.jsSVG',
    'p5.dom',
    'p5.sound',
    'p5.createLoop',
    'gif.js',
  ],
  watch: {
    include: [
      resolve(`./sketch/${src}/**`),
      resolve(`./sketch-common/**`),
      resolve('sketch/*.css')
    ]
  }
};
