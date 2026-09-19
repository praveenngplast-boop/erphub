/* ============================================================
   tasks.js
   Depends on: data.js, utils.js, components.js, app.js
   ============================================================ */

(function () {
  if (!App.init('tasks', 'Tasks')) return;

  let view = 'kanban';
  let filters = { q: '', priority: 'All' };
  const KANBAN_COLS = ['Backlog', 'In Progress', 'Review', 'Done'];

  function getList() {
    const state = Store.get();
    const tasks = state.tasks || [];
    return tasks.filter((t) => {
      if (filters.priority !== 'All' && t.priority !== filters.priority) return false;
      if (filters.q && !(`${t.id} ${t.title}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
      return true;
    });
  }

  function saveTask(task) {
    const state = Store.get();
    const tasks = [...(state.tasks || [])];
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx > -1) tasks[idx] = task; else tasks.unshift(task);
    Store.set({ tasks });
  }

  function openDrawer(id) {
    const state = Store.get();
    const t = (state.tasks || []).find((x) => x.id === id);
    if (!t) return;

    renderDrawer({
      titleHtml: t.title,
      subHtml: `${t.id} · ${t.module || ''}`,
      bodyHtml: `
        <div class="drawer-section">
          <div class="h">Progress</div>
          ${renderProgressBar(t.progress)}
          <div style="font-size:11.5px;color:var(--text-faint);margin-top:6px;">${t.progress}% complete</div>
        </div>
        <div class="drawer-section">
          <div class="h">Details</div>
          <div class="kv-row"><span class="k">Owner</span><span class="v">${t.owner || '—'}</span></div>
          <div class="kv-row"><span class="k">Priority</span><span class="v">${t.priority || '—'}</span></div>
          <div class="kv-row"><span class="k">Due date</span><span class="v">${Utils.fmtDate(t.due)}</span></div>
          <div class="kv-row"><span class="k">Status</span><span class="v">${t.status || '—'}</span></div>
        </div>
        <div class="drawer-section">
          <div class="h">Checklist</div>
          ${(t.checklist || []).map((c, i) => `
            <label style="display:flex;align-items:center;gap:9px;padding:6px 0;font-size:13px;cursor:pointer;">
              <input type="checkbox" data-idx="${i}" class="checklist-box" ${c.done ? 'checked' : ''} />
              <span style="${c.done ? 'text-decoration:line-through;color:var(--text-faint);' : ''}">${c.text}</span>
            </label>`).join('')}
        </div>
      `,
      footHtml: `<select id="drStatus" style="border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:13px;background:var(--bg);flex:1;">
                    ${KANBAN_COLS.map((s) => `<option ${s === t.status ? 'selected' : ''}>${s}</option>`).join('')}
                 </select>
                 <button class="btn btn-primary" id="saveTaskBtn">Save</button>`,
    });

    Utils.$$('.checklist-box').forEach((box) => {
      box.addEventListener('change', () => {
        const idx = Number(box.getAttribute('data-idx'));
        const list = t.checklist || [];
        if (!list[idx]) return;
        list[idx].done = box.checked;
        const doneCount = list.filter((c) => c.done).length;
        t.progress = Math.round((doneCount / Math.max(1, list.length)) * 100);
        saveTask(t);
        openDrawer(id);
        render();
      });
    });

    const saveBtn = document.getElementById('saveTaskBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        t.status = document.getElementById('drStatus').value;
        if (t.status === 'Done') t.progress = 100;
        saveTask(t);
        renderToast('Task updated', 'success');
        closeDrawer();
        render();
      });
    }
  }

  function openCreateModal() {
    const state = Store.get();
    const modules = state.modules && state.modules.length ? state.modules : (ERP_SEED.modules || []);
    const users = state.users && state.users.length ? state.users : (ERP_SEED.users || []);

    renderModal({
      title: 'New Task',
      bodyHtml: `
        <div class="field"><label>Title</label><input id="newTitle" placeholder="What needs to be done?" /></div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1;"><label>Module</label>
            <select id="newModule">${modules.map((m) => `<option>${m}</option>`).join('')}</select>
          </div>
          <div class="field" style="flex:1;"><label>Priority</label>
            <select id="newPriority">${['Critical', 'High', 'Medium', 'Low'].map((p) => `<option>${p}</option>`).join('')}</select>
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1;"><label>Owner</label>
            <select id="newOwner">${users.map((u) => `<option>${u.name}</option>`).join('')}</select>
          </div>
          <div class="field" style="flex:1;"><label>Due date</label><input id="newDue" type="date" /></div>
        </div>
      `,
      footHtml: `<button class="btn btn-secondary" data-close-modal>Cancel</button>
                 <button class="btn btn-primary" id="createTaskBtn">Create task</button>`,
    });

    document.getElementById('createTaskBtn').addEventListener('click', () => {
      const title = document.getElementById('newTitle').value.trim();
      if (!title) { renderToast('Title is required', 'error'); return; }
      const task = {
        id: Utils.uid('TSK'),
        title,
        status: 'Backlog',
        priority: document.getElementById('newPriority').value,
        owner: document.getElementById('newOwner').value,
        due: document.getElementById('newDue').value || new Date().toISOString().slice(0, 10),
        module: document.getElementById('newModule').value,
        progress: 0,
        checklist: [
          { text: 'Gather requirements', done: false },
          { text: 'Implement change', done: false },
        ],
      };
      saveTask(task);
      renderToast('Task created', 'success');
      closeModal('appModal');
      render();
    });
  }

  function renderListView(rows) {
    const tableId = 'tasksTable';
    const html = renderDataTable({
      tableId,
      columns: [
        { label: 'ID',       render: (t) => `<span class="id-cell">${t.id}</span>` },
        { label: 'Title',    key: 'title' },
        { label: 'Module',   key: 'module' },
        { label: 'Priority', render: (t) => renderPriorityBadge(t.priority) },
        { label: 'Status',   render: (t) => renderStatusBadge(t.status) },
        { label: 'Owner',    render: (t) => `<div class="avatar-row">${renderAvatar(t.owner, 22)}<span>${t.owner || '—'}</span></div>` },
        { label: 'Due',      render: (t) => Utils.fmtDate(t.due) },
        { label: 'Progress', render: (t) => `<div style="width:80px;">${renderProgressBar(t.progress)}</div>` },
      ],
      rows,
      emptyTitle: 'No matching tasks',
      emptyDesc: 'Try clearing filters or search terms.',
    });
    // Wire row clicks after insertion (caller injects the html, then calls this)
    setTimeout(() => wireDataTableRows(tableId, openDrawer), 0);
    return html;
  }

  function renderKanbanView(rows) {
    const cols = KANBAN_COLS.map((status) => {
      const items = rows.filter((t) => t.status === status);
      const cards = items.map((t) => `
        <div class="kcard" draggable="true" data-id="${t.id}">
          <div class="t">${t.title}</div>
          <div class="meta-row">
            ${renderPriorityBadge(t.priority)}
            ${renderAvatar(t.owner, 22)}
          </div>
        </div>
      `).join('');
      return `
        <div class="kanban-col" data-status="${status}">
          <div class="kanban-col-head"><span>${status}</span><span class="n">${items.length}</span></div>
          ${cards || `<div style="font-size:12px;color:var(--text-faint);padding:8px 4px;">No tasks</div>`}
        </div>`;
    }).join('');
    return `<div class="kanban">${cols}</div>`;
  }

  function wireKanban() {
    let draggedId = null;
    Utils.$$('.kcard').forEach((card) => {
      card.addEventListener('dragstart', () => {
        draggedId = card.getAttribute('data-id');
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('click', () => {
        if (!card.classList.contains('dragging')) openDrawer(card.getAttribute('data-id'));
      });
    });
    Utils.$$('.kanban-col').forEach((col) => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
      col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        if (!draggedId) return;
        const state = Store.get();
        const task = (state.tasks || []).find((t) => t.id === draggedId);
        if (task) {
          task.status = col.getAttribute('data-status');
          if (task.status === 'Done') task.progress = 100;
          saveTask(task);
          renderToast(`Moved to ${task.status}`, 'success');
          render();
        }
      });
    });
  }

  function render() {
    const root = document.getElementById('pageRoot');
    const rows = getList();
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Tasks</h1><div class="desc">${rows.length} task${rows.length === 1 ? '' : 's'}</div></div>
        <div class="page-actions">
          <div class="view-toggle">
            <button data-v="list" class="${view === 'list' ? 'active' : ''}">List</button>
            <button data-v="kanban" class="${view === 'kanban' ? 'active' : ''}">Kanban</button>
          </div>
          <button class="btn btn-primary" id="newTaskBtn">${ICONS.plus} New Task</button>
        </div>
      </div>
      <div class="filter-bar">
        <div class="search-input">${ICONS.search}<input id="searchInput" placeholder="Search tasks…" value="${filters.q}" /></div>
        <select class="select-chip" id="priorityFilter">
          ${['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => `<option ${filters.priority === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div id="viewHost">${view === 'kanban' ? renderKanbanView(rows) : renderListView(rows)}</div>
    `;

    Utils.$$('.view-toggle button').forEach((b) =>
      b.addEventListener('click', () => { view = b.getAttribute('data-v'); render(); })
    );

    document.getElementById('newTaskBtn').addEventListener('click', openCreateModal);

    document.getElementById('searchInput').addEventListener('input',
      Utils.debounce((e) => { filters.q = e.target.value; render(); }, 180)
    );

    document.getElementById('priorityFilter').addEventListener('change',
      (e) => { filters.priority = e.target.value; render(); }
    );

    if (view === 'kanban') wireKanban();
  }

  render();

  const openId = Utils.qs('open');
  if (openId) setTimeout(() => openDrawer(openId), 60);
})();