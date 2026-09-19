/* ============================================================
   app.js — boot sequence shared by every non-login page.
   Depends on: data.js, utils.js, components.js
   ============================================================ */

const App = {
  pageKey: null,
  crumb: '',

  requireAuth() {
    const state = Store.get();
    if (!state.session) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  mountShell() {
    const shell = document.getElementById('appShell');
    if (!shell) {
      console.error('[App] #appShell not found — shell will not mount.');
      return;
    }
    shell.classList.add('app-shell');
    shell.innerHTML = `
      ${renderSidebar(this.pageKey)}
      <div class="main">
        ${renderTopbar(this.crumb)}
        <div class="page" id="pageRoot"></div>
      </div>
    `;
    this.applyTheme();
    this.wireTopbar();
    this.wireSidebarMobile();
    this.wireCmdk();
  },

  applyTheme() {
    const state = Store.get();
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = state.theme === 'dark' ? ICONS.sun : ICONS.moon;
  },

  wireTopbar() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const state = Store.get();
        Store.set({ theme: state.theme === 'dark' ? 'light' : 'dark' });
        this.applyTheme();
      });
    }

    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect) {
      unitSelect.addEventListener('change', () => {
        Store.set({ unit: unitSelect.value });
        renderToast(`Unit filter set to ${unitSelect.value}`, 'success');
        if (window.onUnitChange) window.onUnitChange(unitSelect.value);
      });
    }

    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        const state = Store.get();
        const overdue = (state.vendors || []).filter((v) => v.overdue).length;
        const open = (state.tickets || []).filter((t) => t.status === 'Open').length;
        renderModal({
          title: 'Notifications',
          bodyHtml: `
            <div class="drawer-section">
              <div class="timeline-item"><div class="tdot" style="background:var(--danger)"></div>
                <div class="tbody"><div class="t">${overdue} vendor follow-ups overdue</div><div class="meta">Check the Vendors page</div></div></div>
              <div class="timeline-item"><div class="tdot" style="background:var(--info)"></div>
                <div class="tbody"><div class="t">${open} tickets currently open</div><div class="meta">Sorted by priority in Tickets</div></div></div>
              <div class="timeline-item"><div class="tdot"></div>
                <div class="tbody"><div class="t">Weekly MIS report ready</div><div class="meta">Available in Reports</div></div></div>
            </div>`,
        });
      });
    }

    const userChip = document.getElementById('userChip');
    if (userChip) userChip.addEventListener('click', () => this.openProfile());
    const navProfile = document.getElementById('nav-profile');
    if (navProfile) navProfile.addEventListener('click', () => this.openProfile());
    const navSettings = document.getElementById('nav-settings');
    if (navSettings) navSettings.addEventListener('click', () => this.openSettings());
  },

  openProfile() {
    const state = Store.get();
    const session = state.session || { name: 'User', role: '' };
    renderModal({
      title: 'Profile',
      bodyHtml: `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          ${renderAvatar(session.name, 52)}
          <div>
            <div style="font-weight:700;font-size:15px;">${session.name}</div>
            <div style="color:var(--text-muted);font-size:12.5px;">${session.role || ''}</div>
          </div>
        </div>
        <div class="drawer-section">
          <div class="kv-row"><span class="k">Username</span><span class="v">${session.username || '—'}</span></div>
          <div class="kv-row"><span class="k">Access level</span><span class="v">${session.role || '—'}</span></div>
          <div class="kv-row"><span class="k">Company</span><span class="v">G Plast Industries</span></div>
        </div>`,
      footHtml: `<button class="btn btn-secondary" data-close-modal>Close</button>
                 <button class="btn btn-danger" id="logoutBtn">Sign out</button>`,
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
      Store.set({ session: null });
      window.location.href = 'index.html';
    });
  },

  openSettings() {
    const state = Store.get();
    renderModal({
      title: 'Settings',
      bodyHtml: `
        <div class="drawer-section">
          <div class="h">Appearance</div>
          <div class="view-toggle" id="settingsThemeToggle">
            <button data-v="light" class="${state.theme !== 'dark' ? 'active' : ''}">${ICONS.sun} Light</button>
            <button data-v="dark" class="${state.theme === 'dark' ? 'active' : ''}">${ICONS.moon} Dark</button>
          </div>
        </div>
        <div class="drawer-section">
          <div class="h">Data</div>
          <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">
            All data is stored locally in this browser. Resetting restores the default units and modules and clears tickets/tasks/vendors.
          </p>
          <button class="btn btn-secondary btn-sm" id="resetDataBtn">Reset demo data</button>
        </div>`,
      footHtml: `<button class="btn btn-secondary" data-close-modal>Close</button>`,
    });

    Utils.$$('#settingsThemeToggle button').forEach((b) => {
      b.addEventListener('click', () => {
        Store.set({ theme: b.getAttribute('data-v') });
        this.applyTheme();
        Utils.$$('#settingsThemeToggle button').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
      });
    });

    document.getElementById('resetDataBtn').addEventListener('click', () => {
      const session = Store.get().session;
      const theme = Store.get().theme;
      Store.reset();
      Store.set({ session, theme });
      renderToast('Data reset', 'success');
      closeModal('appModal');
      setTimeout(() => window.location.reload(), 400);
    });
  },

  wireSidebarMobile() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('sidebarScrim');
    if (!toggle || !sidebar || !scrim) return;
    const open = () => { sidebar.classList.add('open'); scrim.classList.add('open'); };
    const close = () => { sidebar.classList.remove('open'); scrim.classList.remove('open'); };
    toggle.addEventListener('click', open);
    scrim.addEventListener('click', close);
  },

  wireCmdk() {
    const opener = document.getElementById('openCmdk');
    if (opener) opener.addEventListener('click', () => this.openCmdk());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCmdk();
      }
    });
  },

  openCmdk() {
    const state = Store.get();
    const index = [
      ...(state.tickets || []).map((t) => ({ type: 'Ticket', label: t.subject, href: `tickets.html?open=${t.id}` })),
      ...(state.tasks || []).map((t) => ({ type: 'Task', label: t.title, href: `tasks.html?open=${t.id}` })),
      ...(state.vendors || []).map((v) => ({ type: 'Vendor', label: v.name, href: `vendors.html?open=${v.id}` })),
      { type: 'Page', label: 'Dashboard', href: 'dashboard.html' },
      { type: 'Page', label: 'Tickets', href: 'tickets.html' },
      { type: 'Page', label: 'Tasks', href: 'tasks.html' },
      { type: 'Page', label: 'Vendors', href: 'vendors.html' },
      { type: 'Page', label: 'Reports', href: 'reports.html' },
      { type: 'Page', label: 'Units & Modules', href: 'settings-units.html' },
    ];

    const overlay = renderModal({ id: 'cmdkOverlay', title: '', bodyHtml: '' });
    overlay.querySelector('.modal').classList.add('cmdk-modal');

    // Guard: only remove if it exists
    const head = overlay.querySelector('.modal-head');
    if (head) head.remove();

    overlay.querySelector('.modal-body').innerHTML = `
      <input class="cmdk-input" id="cmdkInput" placeholder="Search tickets, tasks, vendors…" autocomplete="off" />
      <div class="cmdk-results" id="cmdkResults"></div>
    `;
    const input = overlay.querySelector('#cmdkInput');
    const results = overlay.querySelector('#cmdkResults');

    const draw = (q) => {
      const filtered = q
        ? index.filter((it) => it.label.toLowerCase().includes(q.toLowerCase())).slice(0, 30)
        : index.slice(0, 12);
      results.innerHTML = filtered.length
        ? filtered.map((it) => `<div class="cmdk-item" data-href="${it.href}"><span>${it.label}</span><span class="tag">${it.type}</span></div>`).join('')
        : `<div style="padding:20px;text-align:center;color:var(--text-faint);font-size:13px;">No matches</div>`;
      Utils.$$('.cmdk-item', results).forEach((row) => {
        row.addEventListener('click', () => { window.location.href = row.getAttribute('data-href'); });
      });
    };
    draw('');
    input.addEventListener('input', Utils.debounce(() => draw(input.value), 120));
    setTimeout(() => input.focus(), 30);
  },

  init(pageKey, crumb) {
    this.pageKey = pageKey;
    this.crumb = crumb;
    if (!this.requireAuth()) return false;
    this.mountShell();
    return true;
  },
};