# Forsaken ideas

JavaScript sketchbook build with Vite and Vue.

Forsaken-Ideas is a workflow to create a gallery from a folder which contains many bundled project.

The gallery is developed with VueJS, it's quite simple, it's a classic project that queries a JSON file (in production / you don't need to rebuild the Vue app to add a new project) to list all the projects.

The part that generates the projects is more interesting. The usual `yarn run dev` command is sufixed with the project name, enabling you to generate a multitude of projects from a single configuration. So, to develop project x (contained in the sketch/x/ folder) you can run yarn run sketch:dev x, which will set sketch/x/index.js as the input to your application (used by Vite).

This workflow is designed to be modular and space-saving, so the p5.js and three.js libraries are loaded from a cdn. To indicate how to load the library, simply specify it in a file named property.json (sort of tiny and internal package.json), which must be present in all projects. It is used to indicate information that will be reinjected into the HTML template (interaction button with the program, display of a short note on the project, date, topic...) and in the gallery. 



```
├── dist/ 			Whole site exported (production ready)
├── public/ 			Where projects are exported (to be used on gallery Vue app)
├── sketch/
│   ├──  a-title-of-a-projec/ 	
│   │				Where you code new sketch
│   ├──  assets/ 		A folder to store some files (fonts, img), Vite will lookat this specific folder
│   ├──  index.js 		Sketch entry point
│   ├──  property.json 		Sketch properties, details below
│   ├──  capture.jpg 		1200px illustration for Open Graph (adapt the height to fit you image ratio)
│   └──  thumbnail.webp 	600px image for gallery (adapt the height too)
│
├── sketch-common/ 		Files you want to import in multiple sketch (not used in production, only on development)
├── src/ 			Gallery Vue App (dev files)
├── tasks/ 			Nodejs scripts used in Vite config (CLI to create a new project, batch building all project, merge each sketch metadata into a central file used by the gallery)
│   ├── site-meta.json 		Some info that will be injected in HTML <meta> (OpenGraph)
│   └── sketch.vite.config.js 	Task to dev or build a specific sketch

```

### Sketch properties example (could be generated with a CLI, see yarn command below)
```json
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
            "name": "capture",
            "icon": "desktop-download"
        }
    ]
}
```

Property | Description
|:--- | :--- |
libs | (Array) For each project you could import JS libraries (from CDN you could also used file from node_modules)
info | (String) Short text about the project (displayed on project page and on Open Graph), accept HTML markup
date | (String) A YYYY-MM-DD date of creation
action | (Array) An array of action objecct (property below) Additional icon menu action (to interact with your script)
action.name | (String) A sketch function to call (must be declared as window.name)
action.icon | (String) An icon name (must be declared in sketch-template.html)



### Yarn tasks

#### Sketch command 

| command | description |
| :--- | :--- |
|yarn run sketch:setup {sketch} | Setup a new project or a config of an old one (create a folder with index.html and vite.config.js |
|yarn run sketch:dev {sketch} --host| Launch a sketch with Vite (dev server) |
| yarn run sketch:build {sketch} | Build the sketch and store files in ./public/sketch/{sketch} |
| yarn run sketck:list | List all project in a JSON file ./public/sketch/index.json |
| yarn run sketch:publish | Copy all built from public/sketch to dist/sketch | 

{sketch} the name of the folder where the sketch is 


#### Gallery command


| command | description |
| :--- | :--- |
| yarn run gallery:dev | start a dev server for the Vue gallery in src/ |
| yarn run gallery:build | export the gallery in ./dist |
