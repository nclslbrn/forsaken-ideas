# XYZ

A tool that allows you to design several sketches with the same webpack script and list every sketch into an index.
Usefull for offline prototyping and online showcasing.

## Scripting sketch
To start you have to create a folder for your sketch and start writing an index.js file where you can include every dependencies you need.
You can work on it with live reload with wepack webserver by using:
`npm run watch -- -- the-name-of-the-folder-of-your-script`

Once your script is done, you can export it into the `public` folder by using:
`npm run export -- -- the-name-of-the-folder-of-your-script`

## Showcase / index you sketch
If you want to work on homepage which list every sketches, you can reindex every exported sketch by  using:
`npm run index``

And if you want to work on the design or the content of the homepage (stored into src/pug/) you can use:
`npm run watch-index`

## Conclusion
The content of the public folder is ready for production and can be put on a basic hosting without node.js.