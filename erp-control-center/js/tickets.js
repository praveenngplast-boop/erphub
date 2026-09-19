/* ============================================================
   tickets.js
   ============================================================ */

(function () {
  if (!App.init('tickets', 'Tickets')) return;

  let filters = { q: '', status: 'All', priority: 'All', module: 'All' };

  function getList() {
    const state = Store.get();
    const unit = state.unit;
    return state.tickets.filter((t) => {
      if (unit && unit !== 'All Units' && t.unit !== unit) return false;
      if (filters.status !== 'All' && t.status !== filters.status) return false;
      if (filters.priority !== 'All' && t.priority !== filters.priority) return false;
      if (filters.module !== 'All' && t.module !== filters.module) return false;
      if (filters.q && !(`${t.id} ${t.subject}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => (a.updated < b.updated ? 1 : -1));
  }

  function saveTicket(ticket) {
    const state = Store.get();
    const idx = state.tickets.findIndex((t) => t.id === ticket.id);
    const tickets = [...state.tickets];
    if (idx > -1) tickets[idx] = ticket; else tickets.unshift(ticket);
    Store.set({ tickets });
  }

  function openDrawer(id) {
    const state = Store.get();
    const t = state.tickets.find((x) => x.id === id);
    if (!t) return;
    renderDrawer({
      titleHtml: t.subject,
      subHtml: `${t.id} · ${t.module} · ${t.unit}`,
      bodyHtml: `
        <div class="drawer-section">
          <div class="h">Status &amp; Priority</div>
          <div style="display:flex;gap:10px;margin-bottom:4px;">
            <select class="field" id="drStatus" style="border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:13px;background:var(--bg);flex:1;">
              ${['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => `<option ${s === t.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            <select id="drPriority" style="border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:13px;background:var(--bg);flex:1;">
              ${['Critical', 'High', 'Medium', 'Low'].map((p) => `<option ${p === t.priority ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="drawer-section">
          <div class="h">Details</div>
          <div class="kv-row"><span class="k">Raised by</span><span class="v">${t.raisedBy}</span></div>
          <div class="kv-row"><span class="k">Assigned to</span><span class="v">${t.assignedTo}</span></div>
          <div class="kv-row"><span class="k">Created</span><span class="v">${Utils.fmtDate(t.created)}</span></div>
          <div class="kv-row"><span class="k">Last updated</span><span class="v">${Utils.fmtDate(t.updated)}</span></div>
        </div>
        <div class="drawer-section">
          <div class="h">Description</div>
          <p style="font-size:13px;line-height:1.6;color:var(--text-muted);">${t.description}</p>
        </div>
        <div class="drawer-section">
          <div class="h">Activity</div>
          ${t.comments.map((c) => `
            <div class="timeline-item">
              <div class="tdot"></div>
              <div class="tbody"><div class="t">${c.by}</div><div class="meta">${Utils.fmtDate(c.time)} · ${c.text}</div></div>
            </div>`).join('')}
        </div>
      `,
      footHtml: `<button class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                 <button class="btn btn-primary" id="saveTicketBtn" style="flex:1;justify-content:center;">Save changes</button>`,
    });
    document.getElementById('saveTicketBtn').addEventListener('click', () => {
      t.status = document.getElementById('drStatus').value;
      t.priority = document.getElementById('drPriority').value;
      t.updated = new Date().toISOString().slice(0, 10);
      saveTicket(t);
      renderToast('Ticket updated', 'success');
      closeDrawer();
      render();
    });
  }

  function openCreateModal() {
    renderModal({
      title: 'New Ticket',
      bodyHtml: `
        <div class="field"><label>Subject</label><input id="newSubject" placeholder="Short description of the issue" /></div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1;"><label>Module</label>
            <select id="newModule">${ERP_SEED.modules.map((m) => `<option>${m}</option>`).join('')}</select>
          </div>
          <div class="field" style="flex:1;"><label>Unit</label>
            <select id="newUnit">${ERP_SEED.units.map((u) => `<option>${u}</option>`).join('')}</select>
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1;"><label>Priority</label>
            <select id="newPriority">${['Critical', 'High', 'Medium', 'Low'].map((p) => `<option>${p}</option>`).join('')}</select>
          </div>
          <div class="field" style="flex:1;"><label>Assign to</label>
            <select id="newAssignee">${ERP_SEED.users.map((u) => `<option>${u.name}</option>`).join('')}</select>
          </div>
        </div>
        <div class="field"><label>Description</label><textarea id="newDesc" rows="3" placeholder="Details for the assignee"></textarea></div>
      `,
      footHtml: `<button class="btn btn-secondary" data-close-modal>Cancel</button>
                 <button class="btn btn-primary" id="createTicketBtn">Create ticket</button>`,
    });
    document.getElementById('createTicketBtn').addEventListener('click', () => {
      const subject = document.getElementById('newSubject').value.trim();
      if (!subject) { renderToast('Subject is required', 'error'); return; }
      const state = Store.get();
      const today = new Date().toISOString().slice(0, 10);
      const ticket = {
        id: Utils.uid('TCK'),
        subject,
        module: document.getElementById('newModule').value,
        unit: document.getElementById('newUnit').value,
        priority: document.getElementById('newPriority').value,
        status: 'Open',
        raisedBy: (state.session && state.session.name) || 'Praveen K',
        assignedTo: document.getElementById('newAssignee').value,
        created: today,
        updated: today,
        description: document.getElementById('newDesc').value.trim() || 'No additional description provided.',
        comments: [{ by: (state.session && state.session.name) || 'Praveen K', text: 'Ticket created.', time: today }],
      };
      saveTicket(ticket);
      renderToast('Ticket created', 'success');
      closeModal('appModal');
      render();
    });
  }

  function render() {
    const root = document.getElementById('pageRoot');
    const rows = getList();
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Tickets</h1><div class="desc">${rows.length} ticket${rows.length === 1 ? '' : 's'} matching filters</div></div>
        <div class="page-actions">
          <button class="btn btn-secondary" id="exportBtn">${ICONS.export} Export CSV</button>
          <button class="btn btn-primary" id="newTicketBtn">${ICONS.plus} New Ticket</button>
        </div>
      </div>
      <div class="filter-bar">
        <div class="search-input">${ICONS.search}<input id="searchInput" placeholder="Search tickets…" value="${filters.q}" /></div>
        <select class="select-chip" id="statusFilter">
          ${['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => `<option ${filters.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <select class="select-chip" id="priorityFilter">
          ${['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => `<option ${filters.priority === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <select class="select-chip" id="moduleFilter">
          ${['All', ...ERP_SEED.modules].map((s) => `<option ${filters.module === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      ${renderDataTable({
        columns: [
          { label: 'ID', render: (t) => `<span class="id-cell">${t.id}</span>` },
          { label: 'Subject', render: (t) => t.subject },
          { label: 'Module', key: 'module' },
          { label: 'Unit', key: 'unit' },
          { label: 'Priority', render: (t) => renderPriorityBadge(t.priority) },
          { label: 'Status', render: (t) => renderStatusBadge(t.status) },
          { label: 'Assignee', render: (t) => `<div class="avatar-row">${renderAvatar(t.assignedTo, 22)}<span>${t.assignedTo}</span></div>` },
          { label: 'Updated', render: (t) => Utils.fmtDate(t.updated) },
        ],
        rows,
        onRowClick: openDrawer,
        emptyTitle: 'No matching tickets',
        emptyDesc: 'Try clearing filters or search terms.',
      })}
    `;

    document.getElementById('newTicketBtn').addEventListener('click', openCreateModal);
    document.getElementById('exportBtn').addEventListener('click', () => {
      Utils.csvDownload('tickets.csv', [
        ['ID', 'Subject', 'Module', 'Unit', 'Priority', 'Status', 'Assigned To', 'Updated'],
        ...rows.map((t) => [t.id, t.subject, t.module, t.unit, t.priority, t.status, t.assignedTo, t.updated]),
      ]);
      renderToast('Tickets exported', 'success');
    });
    document.getElementById('searchInput').addEventListener('input', Utils.debounce((e) => { filters.q = e.target.value; render(); }, 180));
    document.getElementById('statusFilter').addEventListener('change', (e) => { filters.status = e.target.value; render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { filters.priority = e.target.value; render(); });
    document.getElementById('moduleFilter').addEventListener('change', (e) => { filters.module = e.target.value; render(); });
  }

  render();
  window.onUnitChange = render;

  const openId = Utils.qs('open');
  if (openId) setTimeout(() => openDrawer(openId), 60);
})();
