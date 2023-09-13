export default function (actions) {
  let htmlOut = '';
  if (actions !== undefined && actions[0]) {
    actions.forEach(act => {
      if (act.name) {
        const actionName = act.name.replace('_', ' ');
        htmlOut += `<li>
          <a href="#" data-action="${act.name}" title="${actionName}">
            <span class="screen-reader-text">${actionName}</span>
            <svg class="icon">
              <use xlink:href="#icon-${act.icon ? act.icon : 'settings'}"></use>
            </svg>
          </a>
        </li>`
      }
    });
  }
  return htmlOut
}