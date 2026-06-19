import { api, setAuth } from '../api/client.js';
import { toast } from '../utils/helpers.js';

export function renderAuth(onLogin) {
  let mode = 'login';

  function getHtml() {
    const isRegister = mode === 'register';

    return `
      <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-4">
        <div class="card w-full max-w-md">
          <div class="mb-6 text-center">
            <h1 class="text-2xl font-bold text-slate-900">AdminRedes</h1>
            <p class="mt-1 text-sm text-slate-500">Administra y publica en tus redes sociales</p>
          </div>

          <div class="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button type="button" id="tab-login"
              class="rounded-md px-3 py-2 text-sm font-medium transition ${!isRegister ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
              Iniciar sesión
            </button>
            <button type="button" id="tab-register"
              class="rounded-md px-3 py-2 text-sm font-medium transition ${isRegister ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
              Registrarse
            </button>
          </div>

          <form id="auth-form" class="space-y-4">
            <div id="name-field" class="${isRegister ? '' : 'hidden'}">
              <label class="mb-1 block text-sm font-medium">Nombre</label>
              <input name="name" type="text" class="input" placeholder="Tu nombre"
                ${isRegister ? 'required' : ''} />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Correo electrónico</label>
              <input name="email" type="email" required class="input" placeholder="tu@correo.com" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Contraseña</label>
              <input name="password" type="password" required minlength="6" class="input"
                placeholder="Mínimo 6 caracteres" />
            </div>
            <div id="confirm-field" class="${isRegister ? '' : 'hidden'}">
              <label class="mb-1 block text-sm font-medium">Confirmar contraseña</label>
              <input name="confirmPassword" type="password" minlength="6" class="input"
                placeholder="Repite tu contraseña" ${isRegister ? 'required' : ''} />
            </div>

            <button type="submit" class="btn-primary w-full" id="auth-submit">
              ${isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-slate-500">
            ${isRegister
              ? '¿Ya tienes cuenta? <button type="button" id="switch-login" class="font-medium text-brand-600 hover:underline">Inicia sesión</button>'
              : '¿Eres nuevo? <button type="button" id="switch-register" class="font-medium text-brand-600 hover:underline">Regístrate gratis</button>'}
          </p>
        </div>
      </div>
    `;
  }

  function bind(root, rerender) {
    const form = root.querySelector('#auth-form');
    const submitBtn = root.querySelector('#auth-submit');

    root.querySelector('#tab-login')?.addEventListener('click', () => {
      mode = 'login';
      rerender();
    });

    root.querySelector('#tab-register')?.addEventListener('click', () => {
      mode = 'register';
      rerender();
    });

    root.querySelector('#switch-login')?.addEventListener('click', () => {
      mode = 'login';
      rerender();
    });

    root.querySelector('#switch-register')?.addEventListener('click', () => {
      mode = 'register';
      rerender();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = Object.fromEntries(fd.entries());

      if (mode === 'register') {
        if (!body.name?.trim()) {
          toast('El nombre es obligatorio', 'error');
          return;
        }
        if (body.password !== body.confirmPassword) {
          toast('Las contraseñas no coinciden', 'error');
          return;
        }
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = mode === 'register' ? 'Creando cuenta...' : 'Entrando...';

        const data =
          mode === 'register'
            ? await api.register({
                name: body.name.trim(),
                email: body.email,
                password: body.password,
              })
            : await api.login({ email: body.email, password: body.password });

        setAuth(data.token, data.user);
        toast(
          mode === 'register' ? `Cuenta creada. Bienvenido, ${data.user.name}` : `Bienvenido, ${data.user.name}`,
          'success'
        );
        onLogin();
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión';
      }
    });
  }

  return {
    html: getHtml(),
    bind(root, rerender) {
      bind(root, () => {
        root.innerHTML = getHtml();
        bind(root, rerender);
      });
    },
  };
}
