/* ============================================================
   vendors.js
   ============================================================ */

(function () {
  if (!App.init('vendors', 'Vendors')) return;

  let filters = { q: '', overdueOnly: false };

  function getList() {
    const state = Store.get();
    const unit = state.unit;
    return state.vendors.filter((v) => {
      if (unit && unit !== 'All Units' && v.unit !== unit) return false;
      if (filters.overdueOnly && !v.overdue) return false;
      if (filters.q && !(`${v.id} ${v.name}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => (a.overdue === b.overdue ? 0 : a.overdue ? -1 : 1));
  }

  function saveVendor(vendor) {
    const state = Store.get();
    const idx = state.vendors.findIndex((v) => v.id === vendor.id);
    const vendors = [...state.vendors];
    if (idx > -1) vendors[idx] = vendor;
    Store.set({ vendors });
  }

  function openDrawer(id) {
    const state = Store.get();
    const v = state.vendors.find((x) => x.id === id);
    if (!v) return;
    renderDrawer({
      titleHtml: v.name,
      subHtml: `${v.id} · ${v.category} · ${v.unit}`,
      bodyHtml: `
        <div class="drawer-section">
          <div class="h">Contact</div>
          <div class="kv-row"><span class="k">Phone</span><span class="v">${v.contact}</span></div>
          <div class="kv-row"><span class="k">Next follow-up</span>
            <span class="v" style="${v.overdue ? 'color:var(--danger)' : ''}">${Utils.fmtDate(v.nextFollowUp)}${v.overdue ? ' (overdue)' : ''}</span></div>
        </div>
        <div class="drawer-section">
          <div class="h">Follow-up Timeline</div>
          ${v.followUps.map((f) => `
            <div class="timeline-item">
              <div class="tdot"></div>
              <div class="tbody"><div class="t">${Utils.fmtDate(f.date)}</div><div class="meta">${f.note}</div></div>
            </div>`).join('')}
        </div>
        <div class="drawer-section">
          <div class="h">Log a follow-up</div>
          <textarea id="newNote" rows="2" placeholder="What did you discuss or agree?" style="width:100%;border:1px solid var(--border);border-radius:6px;padding:9px 11px;font-size:13px;background:var(--bg);color:var(--text);font-family:inherit;"></textarea>
        </div>
      `,
      footHtml: `<button class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                 <button class="btn btn-primary" id="logFollowupBtn" style="flex:1;justify-content:center;">Add follow-up</button>`,
    });
    document.getElementById('logFollowupBtn').addEventListener('click', () => {
      const note = document.getElementById('newNote').value.trim();
      if (!note) { renderToast('Add a note first', 'error'); return; }
      v.followUps.push({ date: new Date().toISOString().slice(0, 10), note });
      v.overdue = false;
      saveVendor(v);
      renderToast('Follow-up logged', 'success');
      closeDrawer();
      render();
    });
  }

  function render() {
    const root = document.getElementById('pageRoot');
    const rows = getList();
    const overdueCount = Store.get().vendors.filter((v) => v.overdue).length;
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Vendors</h1><div class="desc">${rows.length} vendor${rows.length === 1 ? '' : 's'} · ${overdueCount} follow-up${overdueCount === 1 ? '' : 's'} overdue</div></div>
      </div>
      <div class="filter-bar">
        <div class="search-input">${ICONS.search}<input id="searchInput" placeholder="Search vendors…" value="${filters.q}" /></div>
        <label class="select-chip" style="display:flex;align-items:center;gap:7px;cursor:pointer;">
          <input type="checkbox" id="overdueOnly" ${filters.overdueOnly ? 'checked' : ''} /> Overdue only
        </label>
      </div>
      ${rows.length ? `<div class="vendor-grid">${rows.map((v) => `
        <div class="card vendor-card ${v.overdue ? 'overdue' : ''}" data-id="${v.id}">
          <div class="vhead">
            <div>
              <div class="vname">${v.name}</div>
              <div class="vmeta">${v.id} · ${v.category} · ${v.unit}</div>
            </div>
            ${v.overdue ? `<span class="badge badge-critical">Overdue</span>` : `<span class="badge badge-open">On track</span>`}
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">Next follow-up: <strong style="color:${v.overdue ? 'var(--danger)' : 'var(--text)'}">${Utils.fmtDate(v.nextFollowUp)}</strong></div>
          ${v.followUps.slice(-2).reverse().map((f) => `
            <div class="vfollowup"><div class="fdate">${Utils.fmtDate(f.date)}</div><div class="fnote">${f.note}</div></div>
          `).join('')}
        </div>`).join('')}</div>`
        : renderEmptyState('No vendors match', 'Try clearing filters or search terms.')}
    `;

    Utils.$$('.vendor-card').forEach((card) => card.addEventListener('click', () => openDrawer(card.getAttribute('data-id'))));
    document.getElementById('searchInput').addEventListener('input', Utils.debounce((e) => { filters.q = e.target.value; render(); }, 180));
    document.getElementById('overdueOnly').addEventListener('change', (e) => { filters.overdueOnly = e.target.checked; render(); });
  }

  render();
  window.onUnitChange = render;

  const openId = Utils.qs('open');
  if (openId) setTimeout(() => openDrawer(openId), 60);
})();
