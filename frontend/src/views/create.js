import { api } from '../api/client.js';
import { PLATFORM_INFO, toast } from '../utils/helpers.js';

export async function renderCreate(onNavigate) {
  try {
    const { accounts } = await api.getAccounts();
    const active = accounts.filter((a) => a.isActive);

    if (!active.length) {
      return {
        html: `
          <div class="card max-w-lg text-center">
            <p class="text-lg font-medium">No hay cuentas conectadas</p>
            <p class="mt-2 text-sm text-slate-500">Conecta al menos una red social antes de crear publicaciones.</p>
            <button id="go-accounts" class="btn-primary mt-4">Ir a cuentas</button>
          </div>
        `,
        bind(root) {
          root.querySelector('#go-accounts')?.addEventListener('click', () => onNavigate('accounts'));
        },
      };
    }

    const checkboxes = active
      .map(
        (a) => `
        <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
          <input type="checkbox" name="accountIds" value="${a._id}" class="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <span class="text-lg">${PLATFORM_INFO[a.platform]?.icon || '🌐'}</span>
          <div>
            <p class="text-sm font-medium">${PLATFORM_INFO[a.platform]?.label || a.platform}</p>
            <p class="text-xs text-slate-400">${a.accountName}</p>
          </div>
        </label>
      `
      )
      .join('');

    const html = `
      <div class="max-w-2xl">
        <h2 class="text-2xl font-bold">Nueva publicación</h2>
        <p class="mt-1 text-slate-500">Crea contenido y elige dónde publicarlo</p>

        <form id="create-form" class="card mt-6 space-y-5">
          <div>
            <label class="mb-1 block text-sm font-medium">Título (opcional)</label>
            <input name="title" type="text" class="input" placeholder="Ej. Promoción de verano" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Contenido *</label>
            <textarea name="content" required rows="5" class="input" placeholder="Escribe el texto de tu publicación..."></textarea>
            <p class="mt-1 text-xs text-slate-400">Máximo recomendado: 280 caracteres para X, 2200 para Instagram</p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">URL de imagen o video (opcional)</label>
            <input name="mediaUrl" type="url" class="input" placeholder="https://..." />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Programar publicación (opcional)</label>
            <input name="scheduledAt" type="datetime-local" class="input" />
            <p class="mt-1 text-xs text-slate-400">Hora local de Ciudad de México</p>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Cuentas destino *</label>
            <div class="grid gap-2 sm:grid-cols-2">${checkboxes}</div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary">Guardar borrador</button>
            <button type="button" id="save-and-publish" class="btn-secondary">Guardar y publicar</button>
          </div>
        </form>
      </div>
    `;

    function bind(root, refresh) {
      const form = root.querySelector('#create-form');
      let publishAfterSave = false;

      root.querySelector('#save-and-publish')?.addEventListener('click', () => {
        publishAfterSave = true;
        form.requestSubmit();
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const accountIds = fd.getAll('accountIds');

        if (!accountIds.length) {
          toast('Selecciona al menos una cuenta', 'error');
          return;
        }

        const body = {
          title: fd.get('title'),
          content: fd.get('content'),
          mediaUrl: fd.get('mediaUrl'),
          accountIds,
        };

        const scheduledAt = fd.get('scheduledAt');
        if (scheduledAt) {
          body.scheduledAt = new Date(scheduledAt).toISOString();
        }

        try {
          const submitBtns = form.querySelectorAll('button');
          submitBtns.forEach((b) => (b.disabled = true));

          const { post } = await api.createPost(body);

          if (publishAfterSave && !scheduledAt) {
            await api.publishPost(post._id);
            toast('Publicación creada y enviada', 'success');
          } else {
            toast(scheduledAt ? 'Publicación programada' : 'Borrador guardado', 'success');
          }

          onNavigate('posts');
        } catch (err) {
          toast(err.message, 'error');
          publishAfterSave = false;
        } finally {
          form.querySelectorAll('button').forEach((b) => (b.disabled = false));
          publishAfterSave = false;
        }
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
