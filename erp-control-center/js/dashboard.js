/* ============================================================
   dashboard.js
   ============================================================ */

(function () {
  if (!App.init('dashboard', 'Dashboard')) return;

  function filteredByUnit(list) {
    const unit = Store.get().unit;
    if (!unit || unit === 'All Units') return list;
    return list.filter((x) => x.unit === unit);
  }

  function render() {
    const state = Store.get();
    const tickets = filteredByUnit(state.tickets);
    const tasks = state.tasks;
    const vendors = filteredByUnit(state.vendors);

    const openTickets = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const resolvedThisMonth = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
    const tasksDone = tasks.filter((t) => t.status === 'Done').length;
    const overdueVendors = vendors.filter((v) => v.overdue).length;
    const criticalOpen = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Closed').length;

    const kpis = [
      { label: 'Open Tickets', val: openTickets, icon: ICONS.tickets, tone: 'info', delta: '+3 this week', up: false },
      { label: 'In Progress', val: inProgress, icon: ICONS.tasks, tone: 'warn', delta: 'Steady', up: true },
      { label: 'Resolved / Closed', val: resolvedThisMonth, icon: ICONS.reports, tone: 'ok', delta: '+12% MoM', up: true },
      { label: 'Tasks Completed', val: `${tasksDone}/${tasks.length}`, icon: ICONS.tasks, tone: 'ok', delta: 'On track', up: true },
      { label: 'Vendor Follow-ups Due', val: overdueVendors, icon: ICONS.vendors, tone: 'danger', delta: 'Needs attention', up: false },
      { label: 'Critical Open', val: criticalOpen, icon: ICONS.dashboard, tone: 'danger', delta: 'Priority focus', up: false },
    ];

    const toneColor = { info: 'var(--info)', warn: 'var(--warn)', ok: 'var(--ok)', danger: 'var(--danger)' };
    const toneSoft = { info: 'var(--info-soft)', warn: 'var(--warn-soft)', ok: 'var(--ok-soft)', danger: 'var(--danger-soft)' };

    const kpiHtml = kpis.map((k) => `
      <div class="kpi">
        <div class="top">
          <div class="icon" style="background:${toneSoft[k.tone]};color:${toneColor[k.tone]}">${k.icon}</div>
        </div>
        <div class="val">${k.val}</div>
        <div class="label">${k.label}</div>
        <div class="delta ${k.up ? 'up' : 'down'}">${k.delta}</div>
      </div>
    `).join('');

    // Tickets by module (bar chart, stacked by status)
    const moduleOrder = ERP_SEED.modules;
    const statusColors = { Open: 'var(--info)', 'In Progress': 'var(--warn)', Resolved: 'var(--ok)', Closed: 'var(--text-faint)' };
    const byModule = moduleOrder.map((m) => {
      const inModule = tickets.filter((t) => t.module === m);
      return {
        module: m,
        segments: ['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => inModule.filter((t) => t.status === s).length),
      };
    });
    const maxStack = Math.max(1, ...byModule.map((b) => b.segments.reduce((a, c) => a + c, 0)));
    const barsHtml = byModule.map((b) => {
      const total = b.segments.reduce((a, c) => a + c, 0);
      const stackHeight = Math.max(6, (total / maxStack) * 140);
      const segHtml = b.segments.map((v, i) => {
        if (!v) return '';
        const h = total ? (v / total) * stackHeight : 0;
        const color = ['var(--info)', 'var(--warn)', 'var(--ok)', 'var(--text-faint)'][i];
        return `<div style="height:${h}px;background:${color}" title="${v}"></div>`;
      }).join('');
      return `<div class="bcol"><div class="stack" style="height:${stackHeight}px">${segHtml}</div><div class="lbl">${b.module}</div></div>`;
    }).join('');

    // Task status donut-ish breakdown (simple bar)
    const taskStatuses = ['Backlog', 'In Progress', 'Review', 'Done'];
    const taskColors = ['var(--text-faint)', 'var(--warn)', 'var(--info)', 'var(--ok)'];
    const taskCounts = taskStatuses.map((s) => tasks.filter((t) => t.status === s).length);
    const taskMax = Math.max(1, ...taskCounts);
    const taskBars = taskStatuses.map((s, i) => `
      <div class="bcol">
        <div class="stack" style="height:${(taskCounts[i] / taskMax) * 140}px"><div style="height:100%;background:${taskColors[i]}"></div></div>
        <div class="lbl">${s}</div>
      </div>`).join('');

    const recentTickets = [...tickets].sort((a, b) => (a.updated < b.updated ? 1 : -1)).slice(0, 6);

    const root = document.getElementById('pageRoot');
    root.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <div class="desc">Live snapshot across Sales, Purchase, Production, Quality &amp; Dispatch</div>
        </div>
      </div>

      <div class="kpi-grid">${kpiHtml}</div>

      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:20px;">
        <div class="card chart-card">
          <div class="chart-head">
            <h3>Tickets by Module</h3>
            <div class="legend">
              <span class="li"><span class="sw" style="background:var(--info)"></span>Open</span>
              <span class="li"><span class="sw" style="background:var(--warn)"></span>In Progress</span>
              <span class="li"><span class="sw" style="background:var(--ok)"></span>Resolved</span>
              <span class="li"><span class="sw" style="background:var(--text-faint)"></span>Closed</span>
            </div>
          </div>
          <div class="bars">${barsHtml}</div>
        </div>
        <div class="card chart-card">
          <div class="chart-head"><h3>Task Pipeline</h3></div>
          <div class="bars">${taskBars}</div>
        </div>
      </div>

      <div class="card">
        <div style="padding:16px 16px 0;display:flex;align-items:center;justify-content:space-between;">
          <h3 style="font-size:14px;">Recent Tickets</h3>
          <a href="tickets.html" style="font-size:12.5px;color:var(--accent);font-weight:600;">View all →</a>
        </div>
        <div style="padding:14px 16px 16px;">
          ${renderDataTable({
            columns: [
              { label: 'ID', render: (t) => `<span class="id-cell">${t.id}</span>` },
              { label: 'Subject', render: (t) => t.subject },
              { label: 'Module', key: 'module' },
              { label: 'Priority', render: (t) => renderPriorityBadge(t.priority) },
              { label: 'Status', render: (t) => renderStatusBadge(t.status) },
              { label: 'Updated', render: (t) => Utils.fmtDate(t.updated) },
            ],
            rows: recentTickets,
            onRowClick: (id) => { window.location.href = `tickets.html?open=${id}`; },
            emptyTitle: 'No tickets yet',
            emptyDesc: 'Tickets raised across units will show up here.',
          })}
        </div>
      </div>
    `;
  }

  render();
  window.onUnitChange = render;
})();
