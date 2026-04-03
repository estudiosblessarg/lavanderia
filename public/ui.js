export function renderLayout(content, profile) {
  return `
    <div class="app">
      <div class="header">
        <span>${profile?.email || ''}</span>
        <button data-action="logout">Salir</button>
      </div>

      <div class="content">
        ${content}
      </div>
    </div>
  `;
}
