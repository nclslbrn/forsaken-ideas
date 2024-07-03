# Yarn tasks

# Sketch command 

| command | description |
| :--- | :--- |
|yarn run sketch:setup {sketch} | Setup a new project or a config of an old one (create a folder with index.html and vite.config.js |
|yarn run sketch:dev {sketch} --host| Launch a sketch with Vite (dev server) |
| yarn run sketch:build {sketch} | Build the sketch and store files in ./public/sketch/{sketch} |
| yarn run sketck:list | List all project in a JSON file ./public/sketch/index.json |
| yarn run sketch:publish | Copy all built from public/sketch to dist/sketch | 

{sketch} the name of the folder where the sketch is 


# Gallery command


| command | description |
| :--- | :--- |
| yarn run gallery:dev | start a dev server for the Vue gallery in src/ |
| yarn run gallery:build | export the gallery in ./dist |