import { api } from '../api/client.js';
import { PLATFORM_INFO, platformBadge, toast, confirmAction } from '../utils/helpers.js';

export async function renderAccounts() {
  try {
    const [{ accounts }, { platforms }] = await Promise.all([api.getAccounts(), api.getPlatforms()]);

    const list = accounts.length
      ? accounts
          .map(
            (a) => `
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${PLATFORM_INFO[a.platform]?.icon || '🌐'}</span>
              <div>
                <p class="font-medium">${a.accountName}</p>
                <div class="mt-1">${platformBadge(a.platform)}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs ${a.isActive ? 'text-green-600' : 'text-slate-400'}">
                ${a.isActive ? '● Activa' : '○ Inactiva'}
              </span>
              <button data-toggle="${a._id}" data-active="${a.isActive}" class="btn-secondary text-xs">
                ${a.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button data-delete="${a._id}" class="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
            </div>
          </div>
        `
          )
          .join('')
      : '<p class="py-6 text-sm text-slate-400">Aún no has conectado ninguna cuenta</p>';

    const platformOptions = platforms
      .map((p) => `<option value="${p}">${PLATFORM_INFO[p]?.label || p}</option>`)
      .join('');

    const html = `
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold">Cuentas conectadas</h2>
        <p class="mt-1 text-slate-500">Administra las redes sociales vinculadas a tu cuenta</p>

        <form id="account-form" class="card mt-6 space-y-4">
          <h3 class="font-semibold">Conectar nueva cuenta</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">Plataforma</label>
              <select name="platform" required class="input">${platformOptions}</select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Nombre de cuenta</label>
              <input name="accountName" required class="input" placeholder="@mi_negocio" />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">ID de cuenta (opcional)</label>
            <input name="accountId" class="input" placeholder="ID externo de la plataforma" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Token de acceso (opcional)</label>
            <input name="accessToken" type="password" class="input" placeholder="Para integración con APIs reales" />
          </div>
          <button type="submit" class="btn-primary">Conectar cuenta</button>
        </form>

        <div class="card mt-6">
          <h3 class="font-semibold">Tus cuentas</h3>
          <div class="mt-2">${list}</div>
        </div>
      </div>
    `;

    function bind(root, refresh) {
      const form = root.querySelector('#account-form');

      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const body = Object.fromEntries(fd.entries());

        try {
          form.querySelector('button').disabled = true;
          await api.createAccount(body);
          toast('Cuenta conectada', 'success');
          form.reset();
          refresh();
        } catch (err) {
          toast(err.message, 'error');
        } finally {
          form.querySelector('button').disabled = false;
        }
      });

      root.querySelectorAll('[data-toggle]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const isActive = btn.dataset.active === 'true';
          try {
            await api.updateAccount(btn.dataset.toggle, { isActive: !isActive });
            toast(isActive ? 'Cuenta desactivada' : 'Cuenta activada', 'success');
            refresh();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });

      root.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirmAction('¿Eliminar esta cuenta?')) return;
          try {
            await api.deleteAccount(btn.dataset.delete);
            toast('Cuenta eliminada', 'success');
            refresh();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });
    }

    return { html, bind };
  } catch (err) {
    return {
      html: `<div class="card text-red-600">${err.message}</div>`,
      bind() {},
    };
  }
}
