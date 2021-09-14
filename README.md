# Make

P5.JS/THREE.JS sketchbook build with Webpack and Pug.


```
+ public/ (Where project are exported - production ready HTML/JS/CSS)
+ sketch/ 
|---+ your-fantastic-JS-project/ (Where we code)
|-------+ assets/ (you can also copy assets relative to your project)
|-------+ index.js (Sketch entry point)
|-------+ property.json (Sketch properties details below) 
|-------+ capture.jpg (1067x720px illustration for Open Graph) 
+ src/ (Gallery and project page templates)
|---+ fonts/
|---+ img/
|---+ js/
|--------+ gallery/
|--------+ sketch-common/ (Shared functions & class between multiple sketch)
|---+ json/
|---+ pug/
|---+ sass/
|--------+ mixins/
|--------+ modules/
|--------+ variables/
|--------+ _commons.sccs
|--------+ _layout.scss
|--------+ _mixins.scss
|--------+ _variables.scss
|--------+ frame-canvas.scss (A pre-styled frame surronded <canvas> or <svg>)
|--------+ full-canvas.scss (A full frame page style)
|--------+ gallery.scss (Home page style)
|--------+ notifications.scss
|--------+ progressBar.scss
|--------+ project.scss (Projects style)
+ tasks/ (nodejs tasks declaration)
+ templates/ (boilerplate/example/empty project)
|---+ custom-svg-templates/
|--------+ index.js
|--------+ property.json
|---+ p5-template/
|---+ three-template/
```



### Sketch properties
```
{
    "libs": [
        "p5", 
        "p5.dom", 
        "p5.sound", 
        "p5.collide2D", 
        "p5.js-svg", 
        "three", 
        "svg", 
        "fabric", 
        "p5.createloop"
    ],
    "info": "Coming soon",
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


```libs``` For each project you could import JS libraries (from CDN)

```info``` Short text about the project (used for display and in Open Graph)

```date``` A YYYY/MM/DD date of creation

```action``` Additional icon menu action

```action.name``` A sketch function to call (must be declared as window.name)

```action.icon``` An icon name (must be defined in src/pug/svg-defs.pug)



### Main NPM scripts



```npm run watch:sketch ./sketch/sketch-name/``` Launch sketch at localhost:8080 (index.js & property.json must be filled)

```npm run build:sketch ./sketch/sketch-name/``` Build specific project (exported in public/sketch/sketch-name)

```npm run watch:gallery``` Launch gallery/homepage at localhost:8080 

```npm run build:gallery``` Build the homepage (by referencing each sketches of public/sketch/)

```npm run deploy``` Send the public folder tp remote machine (you must server into ./ftp.json sample below)

```
{
    "user": "username",
    "password": "************",
    "host": "ftp.address.org",
    "port": 21
}
```

### Visual studio code users 

You can watch and build sketch with :

CMD/CTRL + SHIFT + P and choose ```Tasks: Run build task```

Vscode will send current opened tab file directory as entry point to node JS (You have to open in the editor a ./sketch/sketch-name/***.** file before use this shortcut).