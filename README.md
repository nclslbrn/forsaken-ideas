# Make

P5.JS/THREE.JS/whatever libraries sketchbook build with Rollup and Vue.

Make is a workflow to create a gallery from a folder which contains many bundled project.

The gallery is developed with VueJS, it's quite simple, it's a classic project that queries a JSON file (in production) to list all the projects.

The part that generates the projects is more interesting. The usual npm run dev command is prefixed with the project name, enabling you to generate a multitude of projects from a single configuration. So, to develop project x (contained in the sketch/x/ folder) you can run npm run sketch:dev --sketch=x, which will set sketch/x/index.js as the input to your application.

This workflow is designed to be modular and space-saving, so the p5.js and three.js libraries are loaded from a cdn. To indicate how to load the library, simply specify it in a file named property.json, which must be present in all projects. It is used to indicate information that will be reinjected into the HTML template (interaction button with the program, display of a short note on the project, date, topic...). 



```
+ dist/ Whole site exported (production ready)
+ public/ Where projects are exported (to be used on gallery Vue app)
+ sketch/
|---+ your-fantastic-JS-project/ - Where you code new sketch
|-------+ assets/ - A folder to store some files (fonts, img), rollup will lookat this specific folder name
|-------+ index.js - Sketch entry point
|-------+ property.json - Sketch properties, details below
|-------+ capture.jpg - 1200px illustration for Open Graph
|-------+ thumbnail.jpg - 600px image for gallery
+ sketch-common/ - Files you want to import in multiple sketch
+ src/ - Gallery Vue App (dev files)
+ tasks/ - Nodejs scripts used in rollup config
|-------+ additional-menu-items.mjs - Check sketch property.json actions and return HTML markup for sketch action
|-------+ cdn-script-tags.mjs - Check sketch property.json libs and return HTML <script>
|-------+ concat-sketch-properties.mjs - Read all sketch/**/property.json and concatane them in a file array to be used in Vue (gallery) app
|-------+ file-list.mjs - A simple directory file reader
|-------+ html-sketch-template.mjs - A function returning a html template with menu-items, cnd <script> and <meta> injected
|-------+ read-json.mjs - A simple JSON reader
|-------+ strip-tag.mjs - A function to remove HTML markup from sketch properties.info (injected in header <meta>)
|-------+ title-from-slug.mjs - A function to build a sketch title from sketch folder name ('-' become ' ' and '_', ''')
|-------+ ...- A bunch of dotfiles (nothing fancy here)
|-------+ site-meta.json - Some info that will be injected in HTML <meta> (OpenGraph)
|-------+ sketch.build-all.mjs - Rollup task to build all sketch (from sketch/ to public/sketch)
|-------+ sketch.rollup.config.mjs - Task to dev or build a specific sketch

```

### Sketch properties example
```
{
    "libs": [
        "p5",
        "p5.dom",
        "p5.sound",
        "p5.collide2D",
        "p5.js-svg",
        "three",
        "fabric",
        "p5.createloop"
    ],
    "info": "What's I see, what's I try, what's I get",
    "date": "2021-06-15",
    "action": [
        {
            "name": "init",
            "icon": "sync"
        },
        {
            "name": "export",
            "icon": "desktop-download"
        }
    ]
}
```


```libs``` Array: For each project you could import JS libraries (from CDN)

```info``` String: Short text about the project (displayed on project page and on Open Graph), accept HTML markup

```date``` String: A YYYY-MM-DD date of creation

```action``` Array: action list (property below) Additional icon menu action

```action.name``` String: A sketch function to call (must be declared as window.name)

```action.icon``` String: An icon name (must be defined in src/pug/svg-defs.pug)



### Main NPM scripts

```npm run sketch:dev --sketch=sketch-folder-name``` Launch sketch at localhost:10001 (if rollup find index.js & property.json)

```npm run sketch:build --sketch=sketch-folder-name``` Build a sketch

```npm run sketch:list``` Concatenate all sketch/**/property.json in public/sketch/index.json (run it each time you want to include a new project in the gallery)

```npm run sketch:publish``` Copy all bundled sketch into dist/ (add new sketch in production without rebundling the gallery app)

```npm run gallery:dev``` Launch gallery/homepage Vue app at localhost:5173

```npm run gallery:build``` Build the gallery app in dist/

```npm run deploy``` Deploy the site, send a build on a branch (gh-pages)