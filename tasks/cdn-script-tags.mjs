export default function (libs) {
  let htmlOut = '';

  if (libs.includes('p5'))
    htmlOut += '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.min.js"></script>'

  if (libs.includes("p5.dom"))
    htmlOut += '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.dom.min.js"></script>'

  if (libs.includes("p5.sound"))
    htmlOut += '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/addons/p5.sound.min.js"></script>'

  if (libs.includes("p5.collide2D"))
    htmlOut += '<script src="https://cdn.JsDelivr.net/gh/bmoren/p5.collide2D/p5.collide2d.min.js"></script>'

  if (libs.includes("p5.js-svg"))
    htmlOut += '<script src="https://cdn.JsDelivr.net/gh/zenozeng/p5.js-svg/dist/p5.svg.js"></script>'

  if (libs.includes('three')) {
    htmlOut += '<script src="https://unpkg.com/three@0.139.2/build/three.min.js"></script>'
    htmlOut += '<script src="https://unpkg.com/three@0.139.2/examples/js/controls/OrbitControls.js"></script>'
    htmlOut += '<script src="https://unpkg.com/three@0.139.2/examples/js/utils/SceneUtils.js"></script>'
    htmlOut += '<script src="https://unpkg.com/three@0.139.2/examples/js/exporters/GLTFExporter.js"></script>'
    htmlOut += '<script src="https://unpkg.com/three@0.139.2/examples/js/exporters/STLExporter.js"></script>'  
  }

  if (libs.includes('svg'))
    htmlOut += '<script src="https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.0.13/svg.min.js"></script>'

  if (libs.includes('fabric'))
    htmlOut += '<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/3.4.0/fabric.min.js"></script>'

  if (libs.includes("p5.createloop"))
    htmlOut += '<script src="https://unpkg.com/p5.createloop@latest/dist/p5.createloop.js"></script>'

  return htmlOut;
}