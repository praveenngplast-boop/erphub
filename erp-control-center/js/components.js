/* ============================================================
   components.js — reusable render*() functions used by every page
   Depends on: Utils, Store, ERP_SEED (from data.js / utils.js)
   ============================================================ */

/* ---------- Icons ---------- */
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  tickets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  vendors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15v3M12 11v7M17 7v11"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9c.16.38.44.7.79.92.35.22.76.33 1.18.32H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  export: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c2.5.3 6 1.7 6 6"/></svg>',
};

const NAV_ITEMS = [
  { key: 'dashboard', href: 'dashboard.html', label: 'Dashboard', icon: ICONS.dashboard },
  { key: 'tickets',   href: 'tickets.html',   label: 'Tickets',   icon: ICONS.tickets },
  { key: 'tasks',     href: 'tasks.html',     label: 'Tasks',     icon: ICONS.tasks },
  { key: 'vendors',   href: 'vendors.html',   label: 'Vendors',   icon: ICONS.vendors },
  { key: 'reports',   href: 'reports.html',   label: 'Reports',   icon: ICONS.reports },
];

/* ---------- Sidebar ---------- */
function renderSidebar(activeKey) {
  const state = Store.get();
  const tickets = state.tickets || [];
  const tasks   = state.tasks   || [];
  const vendors = state.vendors || [];
  const counts = {
    tickets: tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length,
    tasks:   tasks.filter((t) => t.status !== 'Done').length,
    vendors: vendors.filter((v) => v.overdue).length,
  };
  const items = NAV_ITEMS.map((it) => {
    const count = counts[it.key];
    return `<a class="nav-item ${it.key === activeKey ? 'active' : ''}" href="${it.href}">
      ${it.icon}<span>${it.label}</span>
      ${count ? `<span class="count">${count}</span>` : ''}
    </a>`;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="mark">GP</div>
        <div>
          <div class="name">ERP Control Center</div>
          <div class="sub">G Plast Industries</div>
        </div>
      </div>
      <div class="nav-group">
        <div class="nav-label">Workspace</div>
        ${items}
      </div>
      <div class="sidebar-bottom">
        <div class="nav-group">
          <div class="nav-label">System</div>
          <div class="nav-item ${activeKey === 'settings-units' ? 'active' : ''}" onclick="location.href='settings-units.html'">
            ${ICONS.settings}<span>Units &amp; Modules</span>
          </div>
          <div class="nav-item ${activeKey === 'settings-users' ? 'active' : ''}" onclick="location.href='settings-users.html'">
            ${ICONS.users}<span>Users</span>
          </div>
          <div class="nav-item" id="nav-profile">${ICONS.profile}<span>Profile</span></div>
          <div class="nav-item" id="nav-settings">${ICONS.settings}<span>Settings</span></div>
        </div>
      </div>
    </aside>
    <div class="sidebar-scrim" id="sidebarScrim"></div>
  `;
}

/* ---------- Topbar ---------- */
function renderTopbar(crumb) {
  const state = Store.get();
  const session = state.session || { name: 'User', role: '' };
  const units = ['All Units', ...(state.units || [])];
  const unitOptions = units
    .map((u) => `<option ${state.unit === u ? 'selected' : ''}>${u}</option>`)
    .join('');

  return `
    <header class="topbar">
      <button class="icon-btn sidebar-toggle" id="sidebarToggle" aria-label="Open menu">${ICONS.menu}</button>
      <div class="breadcrumb">
        <span>ERP Control Center</span><span>/</span><span class="current">${crumb}</span>
      </div>
      <div class="topbar-search" id="openCmdk">
        ${ICONS.search}
        <span class="search-label">Search tickets, tasks, vendors…</span>
        <kbd>Ctrl K</kbd>
      </div>
      <div class="topbar-spacer"></div>
      <select class="unit-select" id="unitSelect">${unitOptions}</select>
      <button class="icon-btn" id="themeToggle" aria-label="Toggle theme"></button>
      <button class="icon-btn" id="notifBtn" aria-label="Notifications">${ICONS.bell}<span class="dot"></span></button>
      <div class="user-chip" id="userChip">
        ${renderAvatar(session.name, 28)}
        <div>
          <div class="who">${session.name}</div>
          <div class="role">${session.role || ''}</div>
        </div>
      </div>
    </header>
  `;
}

/* ---------- Small renderers ---------- */
function renderAvatar(name, size) {
  const u = Utils.userByName(name);
  const s = size || 26;
  return `<div class="avatar" style="width:${s}px;height:${s}px;background:${u.color};font-size:${Math.round(s * 0.38)}px">${Utils.initials(name)}</div>`;
}

function renderStatusBadge(status) {
  return `<span class="badge ${Utils.statusBadgeClass(status)}"><span class="dot" style="background:currentColor"></span>${status}</span>`;
}

function renderPriorityBadge(p) {
  return `<span class="badge ${Utils.priorityBadgeClass(p)}">${p}</span>`;
}

function renderProgressBar(pct) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  return `<div class="progress"><div style="width:${p}%"></div></div>`;
}

function renderEmptyState(title, desc) {
  return `<div class="empty-state">
    <div class="icon">${ICONS.empty}</div>
    <h3>${title}</h3>
    <p>${desc}</p>
  </div>`;
}

/* ---------- Data table ---------- */
function renderDataTable({ columns, rows, emptyTitle, emptyDesc, getId, tableId, onRowClick }) {
  if (!rows || !rows.length) {
    return renderEmptyState(emptyTitle || 'Nothing here', emptyDesc || 'Try adjusting your filters.');
  }
  const id = tableId || ('tbl_' + Math.random().toString(36).slice(2, 7));
  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows.map((row) => {
    const cells = columns.map((c) => {
      const val = typeof c.render === 'function' ? c.render(row) : (row[c.key] ?? '—');
      return `<td data-label="${c.label}">${val}</td>`;
    }).join('');
    const rowId = getId ? getId(row) : (row.id ?? '');
    return `<tr data-id="${rowId}">${cells}</tr>`;
  }).join('');

  if (tableId && onRowClick) {
    setTimeout(() => wireDataTableRows(tableId, onRowClick), 0);
  }

  return `<div class="table-wrap responsive-cards" id="${id}">
    <table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  </div>`;
}

function wireDataTableRows(tableIdOrEl, onRowClick) {
  if (!onRowClick) return;
  const wrap = typeof tableIdOrEl === 'string'
    ? document.getElementById(tableIdOrEl)
    : tableIdOrEl;
  if (!wrap) return;
  Utils.$$('tbody tr', wrap).forEach((tr) => {
    tr.addEventListener('click', () => onRowClick(tr.getAttribute('data-id')));
  });
}

/* ---------- Toasts ---------- */
function ensureToastStack() {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = Utils.el('div', { class: 'toast-stack' });
    document.body.appendChild(stack);
  }
  return stack;
}
function renderToast(message, type) {
  const stack = ensureToastStack();
  const toast = Utils.el('div', { class: `toast ${type || ''}` }, [message]);
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .2s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

/* ---------- Modal ---------- */
function renderModal({ title, bodyHtml, footHtml, onOpen, id }) {
  let overlay = document.getElementById(id || 'appModal');
  if (overlay) overlay.remove();
  overlay = Utils.el('div', { class: 'overlay', id: id || 'appModal' });
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-head"><h3>${title || ''}</h3><button class="icon-btn" data-close-modal>${ICONS.close}</button></div>
      <div class="modal-body">${bodyHtml || ''}</div>
      ${footHtml ? `<div class="modal-foot">${footHtml}</div>` : ''}
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('[data-close-modal]')) closeModal(overlay.id);
  });
  document.addEventListener('keydown', escCloseHandler);
  requestAnimationFrame(() => overlay.classList.add('open'));
  if (onOpen) onOpen(overlay);
  return overlay;
}
function closeModal(id) {
  const overlay = document.getElementById(id || 'appModal');
  if (overlay) overlay.classList.remove('open');
}
function escCloseHandler(e) {
  if (e.key !== 'Escape') return;
  Utils.$$('.overlay.open').forEach((o) => o.classList.remove('open'));
  const drawer = document.getElementById('appDrawer');
  if (drawer && drawer.classList.contains('open')) closeDrawer();
  const cmdk = document.getElementById('cmdkOverlay');
  if (cmdk && cmdk.classList.contains('open')) closeModal('cmdkOverlay');
}

/* ---------- Drawer ---------- */
function renderDrawer({ titleHtml, subHtml, bodyHtml, footHtml }) {
  let overlay = document.getElementById('appDrawerOverlay');
  let drawer = document.getElementById('appDrawer');
  if (!overlay) {
    overlay = Utils.el('div', { class: 'drawer-overlay', id: 'appDrawerOverlay' });
    drawer = Utils.el('div', { class: 'drawer', id: 'appDrawer' });
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    overlay.addEventListener('click', closeDrawer);
  }
  drawer.innerHTML = `
    <div class="drawer-head">
      <div class="titles"><h3>${titleHtml}</h3><div class="sub">${subHtml || ''}</div></div>
      <button class="icon-btn" onclick="closeDrawer()">${ICONS.close}</button>
    </div>
    <div class="drawer-body">${bodyHtml}</div>
    ${footHtml ? `<div class="drawer-foot">${footHtml}</div>` : ''}
  `;
  requestAnimationFrame(() => { overlay.classList.add('open'); drawer.classList.add('open'); });
}
function closeDrawer() {
  const overlay = document.getElementById('appDrawerOverlay');
  const drawer = document.getElementById('appDrawer');
  if (overlay) overlay.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
} 