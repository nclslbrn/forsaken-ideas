import fs from 'fs'
import additionalMenuItems from './additional-menu-items.mjs';
import cdnScriptTags from './cdn-script-tags.mjs';

const htmlSketchTemplate = (src, title, sketchProps, siteProps) => {
  let html = fs.readFileSync('sketch/project-template.html', 'utf8');

  const values = {
    src, title, ...sketchProps, ...siteProps,
    'additionalMenuItems': additionalMenuItems(sketchProps.action),
    'cdnScriptTags': cdnScriptTags(sketchProps.libs)
  };

  Object.keys(values).forEach(key => {
    html = html.replaceAll(`{{${key}}}`, values[key])
  });

  return html;
}

export default htmlSketchTemplate