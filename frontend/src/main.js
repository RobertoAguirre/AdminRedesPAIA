import './styles/main.css';
import { api } from './api/client.js';
import { renderLayout, bindLayout, getUser as getStoredUser } from './views/layout.js';
import { renderAuth } from './views/auth.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPosts } from './views/posts.js';
import { renderCreate } from './views/create.js';
import { renderAccounts } from './views/accounts.js';

const app = document.getElementById('app');
let currentView = 'dashboard';

async function render() {
  const user = getStoredUser();

  if (!user) {
    const auth = renderAuth(() => render());
    app.innerHTML = auth.html;
    auth.bind(app, () => render());
    return;
  }

  let content = '';
  let viewBind = null;

  switch (currentView) {
    case 'dashboard':
      content = await renderDashboard();
      break;
    case 'posts': {
      const view = await renderPosts(navigate, render);
      content = view.html;
      viewBind = (root) => view.bind(root);
      break;
    }
    case 'create': {
      const view = await renderCreate(navigate);
      content = view.html;
      viewBind = (root) => view.bind(root, render);
      break;
    }
    case 'accounts': {
      const view = await renderAccounts();
      content = view.html;
      viewBind = (root) => view.bind(root, render);
      break;
    }
    default:
      content = await renderDashboard();
  }

  app.innerHTML = renderLayout(user, currentView, content, navigate, () => render());
  bindLayout(app, navigate, () => render());

  if (viewBind) viewBind(app);
}

function navigate(view) {
  currentView = view;
  render();
}

async function init() {
  const user = getStoredUser();
  if (user) {
    try {
      await api.me();
    } catch {
      localStorage.clear();
    }
  }
  render();
}

init();
