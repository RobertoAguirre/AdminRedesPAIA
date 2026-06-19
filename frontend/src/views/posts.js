import { api } from '../api/client.js';
import { formatDate, platformBadge, statusBadge, toast, confirmAction } from '../utils/helpers.js';

let postFilter = '';

export async function renderPosts(onNavigate, refresh) {
  const filter = postFilter;

  async function loadContent() {
    try {
      const { posts } = await api.getPosts(filter || undefined);

      const rows = posts.length
        ? posts
            .map(
              (p) => `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="font-medium">${escapeHtml(p.title || 'Sin título')}</p>
                <p class="mt-0.5 max-w-md truncate text-xs text-slate-400">${escapeHtml(p.content)}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">${p.platforms.map(platformBadge).join('')}</div>
              </td>
              <td class="px-4 py-3">${statusBadge(p.status)}</td>
              <td class="px-4 py-3 text-sm text-slate-500">${formatDate(p.scheduledAt || p.createdAt)}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  ${
                    p.status !== 'published'
                      ? `<button data-publish="${p._id}" class="text-xs font-medium text-brand-600 hover:underline">Publicar</button>`
                      : ''
                  }
                  <button data-delete="${p._id}" class="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
                </div>
              </td>
            </tr>
          `
            )
            .join('')
        : `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No hay publicaciones</td></tr>`;

      return `
        <div>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold">Publicaciones</h2>
              <p class="mt-1 text-slate-500">Administra borradores, programadas y publicadas</p>
            </div>
            <button id="new-post" class="btn-primary">Nueva publicación</button>
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            ${filterBtn('', 'Todas')}
            ${filterBtn('draft', 'Borradores')}
            ${filterBtn('scheduled', 'Programadas')}
            ${filterBtn('published', 'Publicadas')}
            ${filterBtn('failed', 'Fallidas')}
          </div>

          <div class="card mt-4 overflow-x-auto p-0">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">Contenido</th>
                  <th class="px-4 py-3">Redes</th>
                  <th class="px-4 py-3">Estado</th>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      return `<div class="card text-red-600">${err.message}</div>`;
    }
  }

  function filterBtn(value, label) {
    const active = filter === value;
    return `<button data-filter="${value}" class="rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }">${label}</button>`;
  }

  const html = await loadContent();

  function bind(root) {
    root.querySelector('#new-post')?.addEventListener('click', () => onNavigate('create'));

    root.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        postFilter = btn.dataset.filter;
        refresh();
      });
    });

    root.querySelectorAll('[data-publish]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirmAction('¿Publicar ahora en las cuentas seleccionadas?')) return;
        try {
          btn.disabled = true;
          await api.publishPost(btn.dataset.publish);
          toast('Publicación enviada', 'success');
          refresh();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });

    root.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirmAction('¿Eliminar esta publicación?')) return;
        try {
          await api.deletePost(btn.dataset.delete);
          toast('Publicación eliminada', 'success');
          refresh();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  }

  return { html, bind };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
