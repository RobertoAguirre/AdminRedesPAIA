import { clearAuth, getUser } from '../api/client.js';

export function renderLayout(user, active, content, onNavigate, onLogout) {
  const nav = [
    { id: 'dashboard', label: 'Panel', icon: '📊' },
    { id: 'posts', label: 'Publicaciones', icon: '📝' },
    { id: 'create', label: 'Crear', icon: '✏️' },
    { id: 'accounts', label: 'Cuentas', icon: '🔗' },
  ];

  const navHtml = nav
    .map(
      (item) => `
      <button data-nav="${item.id}"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
        ${active === item.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}">
        <span>${item.icon}</span> ${item.label}
      </button>
    `
    )
    .join('');

  return `
    <div class="flex min-h-screen">
      <aside class="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white lg:block">
        <div class="flex h-full flex-col p-4">
          <div class="mb-8 px-2">
            <h1 class="text-lg font-bold text-brand-700">AdminRedes</h1>
            <p class="text-xs text-slate-400">Zona horaria: CDMX</p>
          </div>
          <nav class="flex-1 space-y-1">${navHtml}</nav>
          <div class="border-t border-slate-100 pt-4">
            <p class="truncate px-2 text-sm font-medium">${user.name}</p>
            <p class="truncate px-2 text-xs text-slate-400">${user.email}</p>
            <button id="logout-btn" class="btn-secondary mt-3 w-full text-xs">Cerrar sesión</button>
          </div>
        </div>
      </aside>

      <div class="flex flex-1 flex-col">
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <h1 class="font-bold text-brand-700">AdminRedes</h1>
          <select id="mobile-nav" class="input w-auto text-sm">
            ${nav.map((item) => `<option value="${item.id}" ${active === item.id ? 'selected' : ''}>${item.label}</option>`).join('')}
          </select>
        </header>
        <main class="flex-1 p-4 lg:p-8">${content}</main>
      </div>
    </div>
  `;
}

export function bindLayout(root, onNavigate, onLogout) {
  root.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => onNavigate(btn.dataset.nav));
  });

  const mobileNav = root.querySelector('#mobile-nav');
  if (mobileNav) {
    mobileNav.addEventListener('change', (e) => onNavigate(e.target.value));
  }

  root.querySelector('#logout-btn')?.addEventListener('click', () => {
    clearAuth();
    onLogout();
  });
}

export { getUser };
