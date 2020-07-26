# Make

A tool to design several sketches with the same webpack script and list every sketch into an index.
Usefull for offline prototyping and online showcasing.

## Directory structure
- node_modules/ You can add packages to fit your needs
- public/ the generated static site root
  - css/
  - fonts/
  - img/
  - sketch/ where sketches are exported
    - sketch-1
      - css
        - main.css
      - index.html
      - main-bundle.js
    - sketch-2
    - ...
  - index.html the home page
  - list-bundle.js js bundle use in homepage
- sketch/ where you write sketches
    - sketch-1
      - index.js &ast; 
      - whatever.js
      - property.json &ast;
    - sketch-2
    - ...
- src/
  - fonts/
  - img/
  - js/ scripts includeds in homepage and sketch bundle
  - pug/ HTML template to build homepage and sketch page
  - sass/ style
- templates/ empty project copy them in ./sketch to begin a new sketch
- tools/ some dependencies and commons functions

&ast;: every sketch need an index.js (entry point for webpack) and a property.json
which specifies project informations.

property.json
```
{
    "libs": [], // An array of libs needed (p5, p5-dom, p5-sound, three, svg) used in src/pug/parts/libs.pug
    "info": "coming soon", // A short paragraph which describe the sketch
    "date": "2020-07-25", // Date of creation of the sketch
    "action": []  // An array of possible action (init, reset, download) used in src/pug/parts/iconav.pug
}
```
## Scripting sketch
To start you have to create a folder for your sketch and start writing an index.js file where you can include every dependencies you need.
You can work on it with live reload with wepack webserver by using:
`npm run watch the-name-of-the-folder-of-your-script` &ast;.

Once your script is done, you can export it into the `public` folder by using:
`npm run export the-name-of-the-folder-of-your-script` &ast;.

&ast; If you use VS code you can use tasks (from .vscode/tasks.json) and simply click watch ${fileDirname} or export ${fileDirname} webpack will use ${fileDirname}/index.js to build the sketch.
  

## Showcase / link your sketches to the homepage
If you want to work on the homepage which lists every sketch, you can build it and get a list of every exported sketch by using:
`npm run index`

And if you want to work on the design or the content of the homepage (stored into src/pug/) you can use:
`npm run watch-index`

## Conclusion
The content of the public folder is ready for use in production and it can be put on a basic hosting without node.js (as static HTML/frontend JS files).
