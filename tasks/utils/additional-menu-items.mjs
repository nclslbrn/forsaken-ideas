export default function (actions) {
  let htmlOut = '';
  if (actions !== undefined && actions[0]) {
    actions.forEach(act => {
      if (act.name) {
        const actionName = act.name.replace('_', ' ');
        htmlOut += `
      <li>
        <button data-action="${act.name}" title="${actionName}">
          <span class="screen-reader-text">${actionName}</span>
          <svg class="icon">
              <use xlink:href="#icon-${act.icon ? act.icon : 'settings'}"></use>
          </svg>
        </button>
      </li>`
      }
    });
  }
  return htmlOut
}
