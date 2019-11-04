const opentype = require('opentype.js')

const fontFile = readTextFile('./assets/postnobillscolombo-semibold.woff')
const font = opentype.parse(fontFile)
console.log(font)

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                //var allText = rawFile.responseText;
                //alert(allText);
                return rawFile.responseText
            }
        }
    }
    rawFile.send(null);
}