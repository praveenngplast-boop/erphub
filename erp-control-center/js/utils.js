/* ============================================================
   utils.js — pure helpers. No ICONS, no render* functions.
   ============================================================ */

const Utils = {
  $(sel, ctx) { return (ctx || document).querySelector(sel); },
  $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); },

  el(tag, attrs, children) {
    const node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach((k) => {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  },

  fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  daysBetween(a, b) {
    const d1 = new Date(a + 'T00:00:00');
    const d2 = new Date((b || new Date().toISOString().slice(0, 10)) + 'T00:00:00');
    return Math.round((d2 - d1) / 86400000);
  },

  initials(name) {
    return (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  },

  userByName(name) {
    return (ERP_SEED.users || []).find((u) => u.name === name) || { name, color: '#8a8578' };
  },

  slugStatus(status) {
    return String(status).toLowerCase().replace(/\s+/g, '-');
  },

  statusBadgeClass(status) {
    const s = Utils.slugStatus(status);
    if (s === 'open' || s === 'backlog') return 'badge-open';
    if (s === 'in-progress' || s === 'review') return 'badge-progress';
    if (s === 'resolved' || s === 'done') return 'badge-resolved';
    return 'badge-closed';
  },

  priorityBadgeClass(p) {
    const s = String(p).toLowerCase();
    if (s === 'critical') return 'badge-critical';
    if (s === 'high') return 'badge-high';
    if (s === 'medium') return 'badge-medium';
    return 'badge-low';
  },

  csvDownload(filename, rows) {
    const csv = rows.map((r) => r.map((cell) => {
      const v = String(cell == null ? '' : cell);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  debounce(fn, ms) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms || 200); };
  },

  qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  },
};