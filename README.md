# Forsaken ideas

P5.JS/THREE.JS/whatever libraries sketchbook build with Vite and Vue.

Forsaken-Ideas is a workflow to create a gallery from a folder which contains many bundled project.

The gallery is developed with VueJS, it's quite simple, it's a classic project that queries a JSON file (in production / you don't need to rebuild the Vue app to add a new project) to list all the projects.

The part that generates the projects is more interesting. The usual npm run dev command is prefixed with the project name, enabling you to generate a multitude of projects from a single configuration. So, to develop project x (contained in the sketch/x/ folder) you can run npm run sketch:dev --sketch=x, which will set sketch/x/index.js as the input to your application (used by Vite).

This workflow is designed to be modular and space-saving, so the p5.js and three.js libraries are loaded from a cdn. To indicate how to load the library, simply specify it in a file named property.json (sort of tiny and internal package.json), which must be present in all projects. It is used to indicate information that will be reinjected into the HTML template (interaction button with the program, display of a short note on the project, date, topic...) and in the gallery. 



```
+ dist/ Whole site exported (production ready)
+ public/ Where projects are exported (to be used on gallery Vue app)
+ sketch/
|---+ your-fantastic-JS-project/ - Where you code new sketch
|-------+ assets/ - A folder to store some files (fonts, img), Vite will lookat this specific folder
|-------+ index.js - Sketch entry point
|-------+ property.json - Sketch properties, details below
|-------+ capture.jpg - 1200px illustration for Open Graph (adapth the height to fit you image ratio)
|-------+ thumbnail.jpg - 600px image for gallery (adapt the height too)
+ sketch-common/ - Files you want to import in multiple sketch (not used in production, only on development)
+ src/ - Gallery Vue App (dev files)
+ tasks/ - Nodejs scripts used in Vite config (CLI to create a new project, batch building all project, merge each sketch metadata into a central file used by the gallery)
|-------+ ...- A bunch of dotfiles (nothing fancy here)
|-------+ site-meta.json - Some info that will be injected in HTML <meta> (OpenGraph)
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


```libs``` Array: For each project you could import JS libraries (from CDN you could also used file from node_modules)

```info``` String: Short text about the project (displayed on project page and on Open Graph), accept HTML markup

```date``` String: A YYYY-MM-DD date of creation

```action``` Array of object (one per action): action list (property below) Additional icon menu action

```action.name``` String: A sketch function to call (must be declared as window.name)

```action.icon``` String: An icon name (must be defined in src/pug/svg-defs.pug)



### Main NPM scripts
```npm run sketch:setup --sketch=sketch-folder-name``` Setup configuration of a new sketch (via a CLI) 

```npm run sketch:dev --sketch=sketch-folder-name``` Launch sketch at localhost:10001 

```npm run sketch:build --sketch=sketch-folder-name``` Build a sketch

```npm run sketch:list``` Concatenate all sketch/**/property.json in public/sketch/index.json (run it each time you want to include a new project in the gallery)

```npm run sketch:publish``` Copy all bundled sketch into dist/ (add new sketch in production without rebuilding the gallery app)

```npm run gallery:dev``` Launch gallery/homepage Vue app at localhost:5173

```npm run gallery:build``` Build the gallery app in dist/
