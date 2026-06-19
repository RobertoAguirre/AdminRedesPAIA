import { api } from '../api/client.js';
import { formatDate, platformBadge, statusBadge, toast } from '../utils/helpers.js';

export async function renderDashboard() {
  try {
    const [{ stats }, { accounts }, { posts }] = await Promise.all([
      api.getStats(),
      api.getAccounts(),
      api.getPosts(),
    ]);

    const recent = posts.slice(0, 5);
    const activeAccounts = accounts.filter((a) => a.isActive).length;

    const recentHtml = recent.length
      ? recent
          .map(
            (p) => `
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">${p.title || p.content.slice(0, 60)}</p>
              <p class="mt-1 text-xs text-slate-400">${formatDate(p.createdAt)}</p>
            </div>
            ${statusBadge(p.status)}
          </div>
        `
          )
          .join('')
      : '<p class="py-4 text-sm text-slate-400">Aún no hay publicaciones</p>';

    return `
      <div>
        <h2 class="text-2xl font-bold">Panel de control</h2>
        <p class="mt-1 text-slate-500">Resumen de tu actividad en redes sociales</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${statCard('Total', stats.total, '📋')}
          ${statCard('Borradores', stats.drafts, '📝')}
          ${statCard('Programadas', stats.scheduled, '⏰')}
          ${statCard('Publicadas', stats.published, '✅')}
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
          <div class="card">
            <h3 class="font-semibold">Publicaciones recientes</h3>
            <div class="mt-4">${recentHtml}</div>
          </div>
          <div class="card">
            <h3 class="font-semibold">Cuentas conectadas</h3>
            <p class="mt-2 text-3xl font-bold text-brand-600">${activeAccounts}</p>
            <p class="text-sm text-slate-500">de ${accounts.length} cuentas registradas</p>
            ${
              accounts.length
                ? `<div class="mt-4 flex flex-wrap gap-2">${accounts.map((a) => platformBadge(a.platform)).join('')}</div>`
                : '<p class="mt-4 text-sm text-slate-400">Conecta tus cuentas para empezar a publicar</p>'
            }
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    return errorView(err.message);
  }
}

function statCard(label, value, icon) {
  return `
    <div class="card">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500">${label}</p>
        <span class="text-xl">${icon}</span>
      </div>
      <p class="mt-2 text-3xl font-bold">${value}</p>
    </div>
  `;
}

function errorView(msg) {
  return `<div class="card text-red-600">${msg}</div>`;
}
