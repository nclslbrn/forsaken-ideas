# Make

A tool to design several sketches with the same webpack script and list every sketch into an index.
Usefull for offline prototyping and online showcasing.

## Directory structure

-   node*modules/ \_You can add packages to fit your needs*
-   public/ _the generated static site root_
    -   css/
    -   fonts/
    -   img/
    -   sketch/ _where sketches are exported_
        -   sketch-1
            -   css
                -   main.css
            -   index.html
            -   main-bundle.js
        -   sketch-2
        -   ...
    -   index.html _the home page_
    -   list-bundle.js _js bundle use in homepage_
-   sketch/ _where you write sketches_
    -   sketch-1
        -   index.js \*
        -   whatever.js
        -   property.json \*
    -   sketch-2
    -   ...
-   src/
    -   fonts/
    -   img/
    -   js/ _scripts includeds in homepage and sketch bundle_
    -   pug/ _HTML template to build homepage and sketch page_
    -   sass/ _style_
-   templates/ _empty project copy them in ./sketch to begin a new sketch_

\*: every sketch need an index.js (entry point for webpack) and a property.json
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
`npm run watch-sketch the-name-of-the-folder-of-your-script` \*.

Once your script is done, you can export it into the `public` folder by using:
`npm run export-sketch the-name-of-the-folder-of-your-script` \*.

If you want to export every sketches in sketch/ you can run
`npm run export-all-sketch` \*

\* If you use VS code you can use tasks (from .vscode/tasks.json) and simply click watch ${fileDirname} or export ${fileDirname} webpack will use \${fileDirname}/index.js to build the sketch.

## Showcase / link your sketches to the homepage

If you want to work on the homepage which lists every sketch, you can build it and get a list of every exported sketch by using:
`npm run gallery`

And if you want to work on the design or the content of the homepage (stored into src/pug/) you can use:
`npm run watch-gallery`

## Conclusion
The content of the public folder is ready for use in production and it can be put on a basic hosting without node.js (as static HTML/frontend JS files).

## EXTRA: Send the public folder online

If you want to send the whole generated site (after running previous command) you can do it but, first, you have to fill a file named `ftp.json` in the roots of the repo. In this one, you have to specify your hosting connection:

```
{
    "user": "your server user",
    "password": "your server password",
    "host": "the host address",
    "port": the host port
}
```

By default the script (deploy.js) put everything in www/ but you can adjust the `remoteRoot` to fit your setup.
