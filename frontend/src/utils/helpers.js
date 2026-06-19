export const PLATFORM_INFO = {
  facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-800', icon: '📘' },
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-800', icon: '📷' },
  x: { label: 'X', color: 'bg-slate-100 text-slate-800', icon: '𝕏' },
  linkedin: { label: 'LinkedIn', color: 'bg-sky-100 text-sky-800', icon: '💼' },
  tiktok: { label: 'TikTok', color: 'bg-purple-100 text-purple-800', icon: '🎵' },
  youtube: { label: 'YouTube', color: 'bg-red-100 text-red-800', icon: '▶️' },
};

export const STATUS_INFO = {
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700' },
  scheduled: { label: 'Programada', color: 'bg-amber-100 text-amber-800' },
  published: { label: 'Publicada', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Fallida', color: 'bg-red-100 text-red-800' },
};

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  }).format(new Date(dateStr));
}

export function platformBadge(platform) {
  const info = PLATFORM_INFO[platform] || { label: platform, color: 'bg-slate-100 text-slate-700', icon: '🌐' };
  return `<span class="badge ${info.color}">${info.icon} ${info.label}</span>`;
}

export function statusBadge(status) {
  const info = STATUS_INFO[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
  return `<span class="badge ${info.color}">${info.label}</span>`;
}

export function toast(message, type = 'info') {
  const colors = {
    info: 'bg-slate-800',
    success: 'bg-green-600',
    error: 'bg-red-600',
  };

  const el = document.createElement('div');
  el.className = `fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${colors[type]}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export function confirmAction(message) {
  return window.confirm(message);
}
